@echo off
title Compiling...
echo Compiling...
electron-packager . -- platform-win32 --arch-all --ignore-node_modules --overwrite
pause