package com.blog.controller;

import cn.hutool.crypto.digest.BCrypt;
import com.blog.common.Result;
import com.blog.dto.LoginDTO;
import com.blog.service.UserService;
import com.blog.vo.LoginVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 *
 * @author blog
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "认证管理", description = "登录/登出接口")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 生成BCrypt密码哈希（临时调试用）
     */
    @GetMapping("/encode")
    @Operation(summary = "生成密码哈希")
    public Result<String> encodePassword(@RequestParam String password) {
        String hash = BCrypt.hashpw(password, BCrypt.gensalt());
        log.info("密码 {} 的BCrypt哈希: {}", password, hash);
        return Result.success(hash);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        log.info("用户登录：{}", loginDTO.getPassword());
        LoginVO loginVO = userService.login(loginDTO);
        return Result.success(loginVO);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    public Result<Void> logout() {
        // JWT无状态，登出由前端删除Token即可
        return Result.success();
    }

}