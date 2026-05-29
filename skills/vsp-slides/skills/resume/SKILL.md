---
name: resume
description: VSP Slides 恢复子技能。用于从已有计划、Marp Markdown、HTML、PDF、审计报告或中断状态继续 PPT 生成/修复流程。触发条件：用户说继续、恢复、接着做、从上次继续、resume。
---

# VSP Slides Resume

从已有产物自动判断断点并继续。

## 断点判断

按顺序检查：

1. 有计划但没有 `slides.md`：进入 `generate`
2. 有 `slides.md` 但没有 HTML/PDF：进入 `render`
3. 有 HTML 但没有审计报告：进入 `audit`
4. 有审计报告且存在 Major/Minor：进入 `polish`
5. 已通过审计但未整理产物：进入 `export`

## 流程

1. 查找用户提供的路径、当前目录、输出目录和最近修改文件。
2. 读取可用产物，给出断点判断和下一步。
3. 若断点明确，执行对应子 skill。
4. 若断点不明确，询问一个最小问题：继续哪个产物或目录。

不要从头重做，除非用户明确要求 clean restart。
