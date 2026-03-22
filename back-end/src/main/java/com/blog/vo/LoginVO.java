package com.blog.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 登录响应VO
 *
 * @author blog
 */
@Data
public class LoginVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 访问令牌
     */
    private String token;

    /**
     * 令牌类型
     */
    private String tokenType = "Bearer";

    /**
     * 过期时间(毫秒)
     */
    private Long expiresIn;

    /**
     * 用户信息
     */
    private UserInfo userInfo;

    @Data
    public static class UserInfo implements Serializable {

        private static final long serialVersionUID = 1L;

        private Long id;
        private String username;
        private String nickname;
        private String avatar;
        private String role;

    }

}