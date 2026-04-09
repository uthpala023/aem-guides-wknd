package com.adobe.aem.guides.wknd.core.servlets;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.ServletException;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.*;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@Component(
    service = Servlet.class,
    property = {
        "sling.servlet.paths=/bin/cards",
        "sling.servlet.methods=GET"
    }
)
public class CardServlet extends SlingSafeMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(CardServlet.class);

    private static final String DAM_PATH = "/content/dam/wknd/cards";
    private static final String SUBSERVICE_NAME = "cards-service-user";

    @Reference
    ResourceResolverFactory resolverFactory;

    @Override
    protected void doGet(SlingHttpServletRequest request,
                         SlingHttpServletResponse response)
            throws ServletException, IOException {

        // ✅ ALWAYS set content type first
        response.setContentType("application/json");

        JsonArray responseArray = new JsonArray();
        ResourceResolver resolver = null;

        try {
            Map<String, Object> authInfo = new HashMap<>();
            authInfo.put(ResourceResolverFactory.SUBSERVICE, SUBSERVICE_NAME);

            resolver = resolverFactory.getServiceResourceResolver(authInfo);

            Resource folder = resolver.getResource(DAM_PATH);

            if (folder == null) {
                LOG.error("Folder not found: {}", DAM_PATH);
                response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write(responseArray.toString()); // []
                return;
            }

            for (Resource fragment : folder.getChildren()) {

                Resource masterNode = fragment.getChild("jcr:content/data/master");

                if (masterNode == null) {
                    LOG.warn("Skipping fragment: {}", fragment.getPath());
                    continue;
                }

                ValueMap props = masterNode.getValueMap();

                JsonObject obj = new JsonObject();
                obj.addProperty("title", props.get("title", ""));
                obj.addProperty("description", props.get("description", ""));
                obj.addProperty("imageUrl",
                        props.get("imageUrl", props.get("fileReference", "")));
                obj.addProperty("redirectPageUrl", props.get("redirectPageUrl", ""));

                responseArray.add(obj);
            }

        } catch (LoginException e) {
            LOG.error("Login failed", e);
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            LOG.error("Error fetching data", e);
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } finally {
            if (resolver != null && resolver.isLive()) {
                resolver.close();
            }
        }

        response.getWriter().write(responseArray.toString());
    }
}