package com.blog.controller;

import com.blog.common.Result;
import com.blog.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Word文档控制器
 *
 * @author blog
 */
@RestController
@RequestMapping("/api/v1/word")
@Tag(name = "Word文档", description = "Word文档解析接口")
public class WordController {

    @Autowired
    private WordService wordService;

    /**
     * 解析Word文档为Markdown
     */
    @PostMapping("/parse")
    @Operation(summary = "解析Word文档")
    public Result<String> parseWord(@RequestParam("file") MultipartFile file) {
        try {
            String markdown = wordService.parseDocxToMarkdown(file);
            return Result.success(markdown);
        } catch (Exception e) {
            return Result.error("解析失败: " + e.getMessage());
        }
    }
}