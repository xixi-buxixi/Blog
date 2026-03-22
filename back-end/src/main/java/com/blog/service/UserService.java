package com.blog.service;

import com.blog.dto.LoginDTO;
import com.blog.vo.LoginVO;

/**
 * 用户服务接口
 *
 * @author blog
 */
public interface UserService {

    /**
     * 用户登录
     *
     * @param loginDTO 登录DTO
     * @return 登录信息
     */
    LoginVO login(LoginDTO loginDTO);

    /**
     * 根据ID查询用户
     *
     * @param id 用户ID
     * @return 用户
     */
    com.blog.entity.User getById(Long id);

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户
     */
    com.blog.entity.User getByUsername(String username);

}