package com.blog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT配置类
 *
 * @author blog
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    /**
     * 密钥
     */
    private String secret;

    /**
     * 过期时间(毫秒)
     */
    private Long expiration;

    /**
     * 请求头名称
     */
    private String header;

    /**
     * 令牌前缀
     */
    private String prefix;

}