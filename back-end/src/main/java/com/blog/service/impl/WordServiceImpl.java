package com.blog.service.impl;

import com.blog.service.WordService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * Word文档服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class WordServiceImpl implements WordService {

    @Value("${app.upload.path:uploads}")
    private String uploadPath;

    @Value("${app.server.url:http://localhost:8080}")
    private String serverUrl;

    @Override
    public String parseDocxToMarkdown(MultipartFile file) throws Exception {
        // 验证文件
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".docx")) {
            throw new IllegalArgumentException("仅支持 .docx 格式文件");
        }

        // 检查文件大小（最大 50MB）
        long maxSize = 50 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("文件过大，最大支持 50MB");
        }

        // 创建上传目录
        String imageDir = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        Path imagePath = Paths.get(uploadPath, "images", imageDir);
        Files.createDirectories(imagePath);

        StringBuilder markdown = new StringBuilder();

        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is)) {

            // 图片计数器
            int[] imageCounter = {0};

            // 遍历所有段落
            for (IBodyElement element : document.getBodyElements()) {
                if (element instanceof XWPFParagraph paragraph) {
                    processParagraph(paragraph, markdown, imagePath.toString(), imageDir, imageCounter);
                } else if (element instanceof XWPFTable table) {
                    processTable(table, markdown);
                }
            }
        } catch (IOException e) {
            log.error("解析Word文档失败", e);
            throw new Exception("文档解析失败: " + e.getMessage());
        }

        return markdown.toString().trim();
    }

    /**
     * 处理段落
     */
    private void processParagraph(XWPFParagraph paragraph, StringBuilder markdown,
                                   String imagePath, String imageDir, int[] imageCounter) {
        // 先处理图片
        boolean hasImages = processImages(paragraph, markdown, imagePath, imageDir, imageCounter);

        String text = paragraph.getText();

        if (text == null || text.trim().isEmpty()) {
            if (!hasImages) {
                markdown.append("\n");
            }
            return;
        }

        // 获取段落样式
        String styleId = paragraph.getStyle();

        // 根据样式判断标题级别
        if (styleId != null) {
            switch (styleId.toLowerCase()) {
                case "heading1", "heading 1" -> {
                    markdown.append("# ").append(text).append("\n\n");
                    return;
                }
                case "heading2", "heading 2" -> {
                    markdown.append("## ").append(text).append("\n\n");
                    return;
                }
                case "heading3", "heading 3" -> {
                    markdown.append("### ").append(text).append("\n\n");
                    return;
                }
                case "heading4", "heading 4" -> {
                    markdown.append("#### ").append(text).append("\n\n");
                    return;
                }
                case "heading5", "heading 5" -> {
                    markdown.append("##### ").append(text).append("\n\n");
                    return;
                }
                case "heading6", "heading 6" -> {
                    markdown.append("###### ").append(text).append("\n\n");
                    return;
                }
            }
        }

        // 处理列表
        if (paragraph.getNumLevelText() != null) {
            markdown.append("- ").append(text).append("\n");
            return;
        }

        // 检查字体大小判断标题（备用方案）
        int fontSize = getFontSize(paragraph);
        if (fontSize >= 28) {
            markdown.append("# ").append(text).append("\n\n");
        } else if (fontSize >= 24) {
            markdown.append("## ").append(text).append("\n\n");
        } else if (fontSize >= 20) {
            markdown.append("### ").append(text).append("\n\n");
        } else {
            // 处理普通段落，保留格式
            String formattedText = processRuns(paragraph.getRuns());
            markdown.append(formattedText).append("\n\n");
        }
    }

    /**
     * 处理段落中的图片
     */
    private boolean processImages(XWPFParagraph paragraph, StringBuilder markdown,
                                   String imagePath, String imageDir, int[] imageCounter) {
        boolean hasImages = false;

        for (XWPFRun run : paragraph.getRuns()) {
            List<XWPFPicture> pictures = run.getEmbeddedPictures();
            for (XWPFPicture picture : pictures) {
                try {
                    XWPFPictureData pictureData = picture.getPictureData();
                    byte[] imageBytes = pictureData.getData();

                    // 检查图片大小（最大 5MB）
                    if (imageBytes.length > 5 * 1024 * 1024) {
                        log.warn("图片过大，跳过: {} bytes", imageBytes.length);
                        continue;
                    }

                    // 生成文件名
                    String format = pictureData.suggestFileExtension();
                    if (format == null || format.isEmpty()) {
                        format = "png";
                    }
                    String fileName = "img_" + (++imageCounter[0]) + "." + format;

                    // 保存图片文件
                    Path filePath = Paths.get(imagePath, fileName);
                    Files.write(filePath, imageBytes);

                    // 生成访问 URL（使用配置的服务器地址）
                    String imageUrl = serverUrl + "/uploads/images/" + imageDir + "/" + fileName;

                    String altText = picture.getDescription();
                    if (altText == null || altText.trim().isEmpty()) {
                        altText = "图片";
                    }

                    markdown.append("![").append(altText).append("](")
                            .append(imageUrl).append(")\n\n");

                    hasImages = true;
                } catch (Exception e) {
                    log.warn("处理图片失败: {}", e.getMessage());
                }
            }
        }

        return hasImages;
    }

    /**
     * 处理文本格式（粗体、斜体等）
     */
    private String processRuns(List<XWPFRun> runs) {
        StringBuilder result = new StringBuilder();
        for (XWPFRun run : runs) {
            String text = run.getText(0);
            if (text == null) continue;

            boolean bold = run.isBold();
            boolean italic = run.isItalic();

            if (bold && italic) {
                result.append("***").append(text).append("***");
            } else if (bold) {
                result.append("**").append(text).append("**");
            } else if (italic) {
                result.append("*").append(text).append("*");
            } else {
                result.append(text);
            }
        }
        return result.toString();
    }

    /**
     * 获取段落字体大小
     */
    private int getFontSize(XWPFParagraph paragraph) {
        for (XWPFRun run : paragraph.getRuns()) {
            int size = run.getFontSize();
            if (size > 0) {
                return size;
            }
        }
        return 12; // 默认字体大小
    }

    /**
     * 处理表格
     */
    private void processTable(XWPFTable table, StringBuilder markdown) {
        List<XWPFTableRow> rows = table.getRows();
        if (rows.isEmpty()) return;

        markdown.append("\n");

        // 处理表头
        XWPFTableRow headerRow = rows.get(0);
        int colCount = headerRow.getTableCells().size();

        markdown.append("|");
        for (XWPFTableCell cell : headerRow.getTableCells()) {
            markdown.append(" ").append(getCellText(cell)).append(" |");
        }
        markdown.append("\n");

        // 分隔线
        markdown.append("|");
        for (int i = 0; i < colCount; i++) {
            markdown.append(" --- |");
        }
        markdown.append("\n");

        // 处理数据行
        for (int i = 1; i < rows.size(); i++) {
            XWPFTableRow row = rows.get(i);
            markdown.append("|");
            for (XWPFTableCell cell : row.getTableCells()) {
                markdown.append(" ").append(getCellText(cell)).append(" |");
            }
            markdown.append("\n");
        }

        markdown.append("\n");
    }

    /**
     * 获取单元格文本
     */
    private String getCellText(XWPFTableCell cell) {
        StringBuilder text = new StringBuilder();
        for (XWPFParagraph para : cell.getParagraphs()) {
            text.append(para.getText());
        }
        return text.toString().replace("|", "\\|").replace("\n", " ").trim();
    }
}