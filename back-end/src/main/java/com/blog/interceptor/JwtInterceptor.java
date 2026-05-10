package com.blog.interceptor;

import com.blog.util.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * JWT认证拦截器
 *
 * @author blog
 */
@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtils jwtUtils;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    // 公开的GET请求路径（无需认证）
    private static final Set<String> PUBLIC_GET_PATHS = new HashSet<>(Arrays.asList(
            "/api/v1/articles",
            "/api/v1/categories",
            "/api/v1/comments"
    ));

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // 公开路径的GET请求允许匿名访问
        if ("GET".equals(method) && isPublicGetPath(requestURI)) {
            log.debug("公开API无需认证: {} {}", method, requestURI);
            return true;
        }

        // 公开路径的POST请求（发表评论）
        if ("POST".equals(method) && requestURI.equals("/api/v1/comments")) {
            log.debug("发表评论无需认证: {} {}", method, requestURI);
            return true;
        }

        // 登录接口允许匿名访问
        if (requestURI.equals("/api/v1/auth/login") || requestURI.equals("/api/v1/auth/encode")) {
            return true;
        }

        // 获取Token
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("请求未携带Token: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未授权，请先登录\",\"data\":null}");
            return false;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        // 验证Token
        if (!jwtUtils.validateToken(token)) {
            log.warn("Token无效或已过期: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"Token无效或已过期\",\"data\":null}");
            return false;
        }

        // 将用户信息存入请求属性
        Long userId = jwtUtils.getUserId(token);
        String username = jwtUtils.getUsername(token);
        request.setAttribute("userId", userId);
        request.setAttribute("username", username);

        log.debug("用户认证成功: userId={}, username={}", userId, username);
        return true;
    }

    /**
     * 检查是否为公开的GET路径
     */
    private boolean isPublicGetPath(String requestURI) {
        // 精确匹配
        if (PUBLIC_GET_PATHS.contains(requestURI)) {
            return true;
        }
        // 文章详情路径 /api/v1/articles/{id}
        if (requestURI.matches("^/api/v1/articles/\\d+$")) {
            return true;
        }
        // 文章统计数据路径 /api/v1/articles/stats
        if (requestURI.equals("/api/v1/articles/stats")) {
            return true;
        }
        // 评论路径 /api/v1/comments/article/{articleId} 和 /api/v1/comments/article/{articleId}/count
        if (requestURI.matches("^/api/v1/comments/article/\\d+$") ||
                requestURI.matches("^/api/v1/comments/article/\\d+/count$")) {
            return true;
        }
        return false;
    }

}