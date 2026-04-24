package com.adobe.aem.guides.wknd.core.models;

import java.util.Collections;
import java.util.List;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class MediaGalleryBannerItemModel {

    private static final String MEDIA_TYPE_VIDEO = "video";
    private static final String DEFAULT_ALT_TEXT = "Media gallery item";

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String mediaType;

    @ValueMapValue
    private String image;

    @ValueMapValue
    private String videoPosterImage;

    @ValueMapValue
    private String thumbnailImage;

    @ValueMapValue
    private String videoUrl;

    @ValueMapValue
    private String altText;

    @ChildResource(name = "labels")
    private List<LabelItemModel> labels;

    public String getTitle() {
        return title;
    }

    public String getMediaType() {
        return mediaType != null ? mediaType : "image";
    }

    public boolean isVideo() {
        return MEDIA_TYPE_VIDEO.equals(getMediaType()) && videoUrl != null && !videoUrl.isEmpty();
    }

    public String getHeroAsset() {
        if (isVideo() && videoPosterImage != null && !videoPosterImage.isEmpty()) {
            return videoPosterImage;
        }

        return image;
    }

    public boolean getHasHeroAsset() {
        return getHeroAsset() != null && !getHeroAsset().isEmpty();
    }

    public String getThumbnailImage() {
        return thumbnailImage != null && !thumbnailImage.isEmpty() ? thumbnailImage : getHeroAsset();
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getAltText() {
        if (altText != null && !altText.isEmpty()) {
            return altText;
        }

        if (title != null && !title.isEmpty()) {
            return title;
        }

        return DEFAULT_ALT_TEXT;
    }

    public String getThumbnailAltText() {
        return getAltText() + " thumbnail";
    }

    public String getPlayButtonLabel() {
        return "Play video";
    }

    public List<LabelItemModel> getLabels() {
        return labels != null ? labels : Collections.emptyList();
    }
}
