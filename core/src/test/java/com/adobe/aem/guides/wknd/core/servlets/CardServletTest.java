package com.adobe.aem.guides.wknd.core.servlets;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;
import java.io.PrintWriter;
import java.io.StringWriter;
import javax.servlet.ServletException;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ValueMap;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class CardServletTest {

    @InjectMocks
    private CardServlet cardServlet;

    @Mock
    private ResourceResolverFactory resolverFactory;

    @Mock
    private ResourceResolver resolver;

    @Mock
    private Resource folder;

    @Mock
    private Resource fragment;

    @Mock
    private Resource masterNode;

    @Mock
    private ValueMap valueMap;

    @Mock
    private SlingHttpServletRequest request;

    @Mock
    private SlingHttpServletResponse response;

    private StringWriter stringWriter;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);

        stringWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));
    }

    // ✅ Test: Successful response
    @Test
    void testDoGet_success() throws Exception {

        when(resolverFactory.getServiceResourceResolver(anyMap())).thenReturn(resolver);
        when(resolver.getResource("/content/dam/wknd/cards")).thenReturn(folder);

        when(folder.getChildren()).thenReturn(java.util.Collections.singletonList(fragment));
        when(fragment.getChild("jcr:content/data/master")).thenReturn(masterNode);
        when(masterNode.getValueMap()).thenReturn(valueMap);

        when(valueMap.get("title", "")).thenReturn("Test Title");
        when(valueMap.get("description", "")).thenReturn("Test Desc");
        when(valueMap.get("imageUrl", "")).thenReturn("img.png");
        when(valueMap.get("redirectPageUrl", "")).thenReturn("/content/page");

        when(resolver.isLive()).thenReturn(true);

        cardServlet.doGet(request, response);

        String output = stringWriter.toString();

        // ✅ FIX: Mockito verify instead of assertEquals
        verify(response).setContentType("application/json");

        assertTrue(output.contains("Test Title"));
        assertTrue(output.contains("Test Desc"));

        verify(resolver).close();
    }

    // ✅ Test: Folder not found
    @Test
    void testDoGet_folderNotFound() throws Exception {

        when(resolverFactory.getServiceResourceResolver(anyMap())).thenReturn(resolver);
        when(resolver.getResource("/content/dam/wknd/cards")).thenReturn(null);

        cardServlet.doGet(request, response);

        verify(response).setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
        verify(response).setContentType("application/json");
    }

    // ✅ Test: Missing master node
    @Test
    void testDoGet_missingMasterNode() throws Exception {

        when(resolverFactory.getServiceResourceResolver(anyMap())).thenReturn(resolver);
        when(resolver.getResource("/content/dam/wknd/cards")).thenReturn(folder);

        when(folder.getChildren()).thenReturn(java.util.Collections.singletonList(fragment));
        when(fragment.getChild("jcr:content/data/master")).thenReturn(null);

        when(resolver.isLive()).thenReturn(true);

        cardServlet.doGet(request, response);

        String output = stringWriter.toString();

        verify(response).setContentType("application/json");
        assertEquals("[]", output);

        verify(resolver).close();
    }

    // ✅ Test: LoginException
    @Test
    void testDoGet_loginException() throws Exception {

        when(resolverFactory.getServiceResourceResolver(anyMap()))
                .thenThrow(new LoginException("Login failed"));

        cardServlet.doGet(request, response);

        verify(response).setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        verify(response).setContentType("application/json");
    }

    // ✅ Test: Generic Exception
    @Test
    void testDoGet_genericException() throws Exception {

        when(resolverFactory.getServiceResourceResolver(anyMap()))
                .thenThrow(new RuntimeException("Error"));

        cardServlet.doGet(request, response);

        verify(response).setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        verify(response).setContentType("application/json");
    }
}