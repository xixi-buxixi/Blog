package com.blog.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.blog.dto.LoginDTO;
import com.blog.entity.User;
import com.blog.exception.BusinessException;
import com.blog.mapper.UserMapper;
import com.blog.service.UserService;
import com.blog.util.JwtUtils;
import com.blog.vo.LoginVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 用户服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        // 查询用户
        User user = getByUsername(loginDTO.getUsername());
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        // 验证密码
        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 生成Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername());

        // 构建返回对象
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setTokenType("Bearer");
        loginVO.setExpiresIn(jwtUtils.getExpiration());

        LoginVO.UserInfo userInfo = new LoginVO.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setRole(user.getRole());
        loginVO.setUserInfo(userInfo);

        log.info("用户登录成功: {}", user.getUsername());
        return loginVO;
    }

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getByUsername(String username) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        return userMapper.selectOne(queryWrapper);
    }

}