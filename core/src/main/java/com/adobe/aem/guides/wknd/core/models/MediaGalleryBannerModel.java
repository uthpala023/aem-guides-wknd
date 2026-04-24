package com.adobe.aem.guides.wknd.core.models;

import java.util.Collections;
import java.util.List;
import javax.annotation.PostConstruct;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
    adaptables = Resource.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class MediaGalleryBannerModel {

    private static final String DEFAULT_TRANSITION_TYPE = "slide";
    private static final int DEFAULT_AUTO_PLAY_INTERVAL = 0;

    @Self
    private Resource resource;

    @ValueMapValue
    private String transitionType;

    @ValueMapValue
    private String componentId;

    @ValueMapValue
    private Boolean showThumbnails;

    @ValueMapValue
    private Integer autoPlayInterval;

    @ChildResource(name = "items")
    private List<MediaGalleryBannerItemModel> items;

    @PostConstruct
    protected void init() {
        if (autoPlayInterval == null) {
            autoPlayInterval = DEFAULT_AUTO_PLAY_INTERVAL;
        }
        if (showThumbnails == null) {
            showThumbnails = true;
        }
        if (transitionType == null || transitionType.isEmpty()) {
            transitionType = DEFAULT_TRANSITION_TYPE;
        }
    }

    public String getTransitionType() {
        return transitionType;
    }

    public String getComponentId() {
        return componentId != null && !componentId.isEmpty()
            ? componentId
            : "media-gallery-banner-" + Integer.toHexString(resource.getPath().hashCode());
    }

    public String getAriaLabel() {
        return "Media gallery banner";
    }

    public Boolean getShowThumbnails() {
        return showThumbnails;
    }

    public Integer getAutoPlayInterval() {
        return autoPlayInterval;
    }

    public List<MediaGalleryBannerItemModel> getItems() {
        return items != null ? items : Collections.emptyList();
    }

    public boolean getHasItems() {
        return !getItems().isEmpty();
    }
}
