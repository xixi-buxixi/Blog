package com.blog.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 用户上下文工具类
 *
 * @author blog
 */
public class UserContext {

    private UserContext() {
    }

    /**
     * 获取当前请求
     */
    public static HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    /**
     * 获取当前用户ID
     */
    public static Long getUserId() {
        HttpServletRequest request = getRequest();
        if (request != null) {
            Object userId = request.getAttribute("userId");
            return userId != null ? (Long) userId : null;
        }
        return null;
    }

    /**
     * 获取当前用户名
     */
    public static String getUsername() {
        HttpServletRequest request = getRequest();
        if (request != null) {
            Object username = request.getAttribute("username");
            return username != null ? (String) username : null;
        }
        return null;
    }

}