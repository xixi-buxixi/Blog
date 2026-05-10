package com.blog.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Word文档服务接口
 *
 * @author blog
 */
public interface WordService {

    /**
     * 将docx文件解析为Markdown格式
     *
     * @param file 上传的文件
     * @return Markdown格式的文本
     */
    String parseDocxToMarkdown(MultipartFile file) throws Exception;
}