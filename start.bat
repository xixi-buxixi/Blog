@echo off
chcp 65001 >nul
echo ========================================
echo        博客项目启动脚本
echo ========================================
echo.

echo [1/2] 启动后端服务...
ssh Tencent "pm2 start blog-backend"

echo.
echo [2/2] 启动前端服务...
ssh Tencent "pm2 start blog-frontend"

echo.
echo ========================================
echo 启动完成！查看服务状态：
echo ========================================
ssh Tencent "pm2 status"

echo.
echo 访问地址：
echo   博客首页: http://111.229.119.195/
echo   后台管理: http://111.229.119.195/admin/
echo   管理端:   http://111.229.119.195/manager/
echo ========================================
pause