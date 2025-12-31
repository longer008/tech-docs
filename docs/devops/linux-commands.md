# Linux 基础命令面试题集

> Linux 常用命令与高频面试题

## A. 面试宝典

### 基础题

#### 1. 文件与目录操作

```
┌─────────────────────────────────────────────────────────────┐
│                    常用文件操作命令                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ls        列出目录内容                                     │
│  cd        切换目录                                         │
│  pwd       显示当前目录                                     │
│  mkdir     创建目录                                         │
│  rmdir     删除空目录                                       │
│  rm        删除文件/目录                                    │
│  cp        复制文件/目录                                    │
│  mv        移动/重命名文件                                  │
│  touch     创建空文件/更新时间戳                            │
│  cat       查看文件内容                                     │
│  more/less 分页查看文件                                     │
│  head/tail 查看文件开头/结尾                                │
│  find      查找文件                                         │
│  locate    快速定位文件                                     │
│  which     查找命令位置                                     │
│  whereis   查找命令、源码、手册位置                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**常用示例：**
```bash
# ls 列出文件
ls              # 列出当前目录
ls -l           # 详细列表（长格式）
ls -la          # 包含隐藏文件
ls -lh          # 人性化显示文件大小
ls -lt          # 按时间排序
ls -lS          # 按大小排序
ls -R           # 递归列出子目录

# cd 切换目录
cd /path/to/dir # 切换到指定目录
cd ~            # 切换到用户主目录
cd -            # 切换到上一个目录
cd ..           # 切换到上级目录
cd ../..        # 切换到上两级目录

# mkdir 创建目录
mkdir dir               # 创建单个目录
mkdir -p a/b/c          # 递归创建多级目录
mkdir -m 755 dir        # 指定权限创建

# rm 删除
rm file                 # 删除文件
rm -r dir               # 递归删除目录
rm -rf dir              # 强制删除（不提示）
rm -i file              # 交互式删除（逐个确认）

# cp 复制
cp file1 file2          # 复制文件
cp -r dir1 dir2         # 递归复制目录
cp -p file1 file2       # 保留权限和时间戳
cp -a dir1 dir2         # 归档复制（保留所有属性）

# mv 移动/重命名
mv file1 file2          # 重命名
mv file dir/            # 移动文件到目录
mv dir1 dir2            # 移动/重命名目录

# find 查找
find /path -name "*.txt"            # 按名称查找
find /path -type f                  # 只查找文件
find /path -type d                  # 只查找目录
find /path -size +10M               # 查找大于10M的文件
find /path -mtime -7                # 7天内修改的文件
find /path -user root               # 查找属于root的文件
find /path -perm 755                # 按权限查找
find /path -name "*.log" -delete    # 查找并删除
find /path -exec command {} \;      # 对结果执行命令
```

---

#### 2. 文件查看与编辑

```bash
# cat 查看文件
cat file                # 显示文件内容
cat -n file             # 显示行号
cat file1 file2 > file3 # 合并文件

# head/tail 查看文件头尾
head file               # 显示前10行
head -n 20 file         # 显示前20行
tail file               # 显示后10行
tail -n 20 file         # 显示后20行
tail -f file            # 实时跟踪文件变化
tail -f file | grep error  # 实时过滤日志

# less/more 分页查看
less file               # 分页查看（支持上下滚动）
more file               # 分页查看（只能向下）
# less 中: q退出, /搜索, n下一个, N上一个, g开头, G结尾

# grep 文本搜索
grep "pattern" file             # 搜索匹配行
grep -i "pattern" file          # 忽略大小写
grep -n "pattern" file          # 显示行号
grep -r "pattern" dir/          # 递归搜索目录
grep -v "pattern" file          # 反向匹配（不包含）
grep -c "pattern" file          # 统计匹配行数
grep -l "pattern" *.txt         # 只显示匹配的文件名
grep -E "regex" file            # 使用扩展正则
grep -A 3 "pattern" file        # 显示匹配行及后3行
grep -B 3 "pattern" file        # 显示匹配行及前3行
grep -C 3 "pattern" file        # 显示匹配行及前后3行

# wc 统计
wc file                 # 行数、单词数、字节数
wc -l file              # 只统计行数
wc -w file              # 只统计单词数
wc -c file              # 只统计字节数

# sort 排序
sort file               # 默认排序
sort -r file            # 逆序
sort -n file            # 数字排序
sort -k 2 file          # 按第2列排序
sort -u file            # 排序并去重

# uniq 去重
uniq file               # 去除连续重复行
uniq -c file            # 统计重复次数
uniq -d file            # 只显示重复行
sort file | uniq        # 先排序再去重

# awk 文本处理
awk '{print $1}' file           # 打印第一列
awk -F: '{print $1}' /etc/passwd  # 指定分隔符
awk '/pattern/{print}' file     # 匹配行
awk '{sum+=$1} END{print sum}' file  # 求和
awk 'NR>1{print}' file          # 跳过第一行

# sed 流编辑器
sed 's/old/new/' file           # 替换第一个匹配
sed 's/old/new/g' file          # 替换所有匹配
sed -i 's/old/new/g' file       # 直接修改文件
sed -n '5,10p' file             # 打印5-10行
sed '/pattern/d' file           # 删除匹配行
sed '1d' file                   # 删除第一行
```

---

#### 3. 权限管理

```
┌─────────────────────────────────────────────────────────────┐
│                    文件权限说明                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  -rwxr-xr-x  1  user  group  1024  Dec 1 10:00  file        │
│  │└─┬─┘└─┬─┘└─┬─┘                                           │
│  │  │    │    │                                              │
│  │  │    │    └── 其他用户权限 (r-x = 5)                    │
│  │  │    └─────── 组权限 (r-x = 5)                          │
│  │  └──────────── 所有者权限 (rwx = 7)                      │
│  └─────────────── 文件类型 (- 普通文件, d 目录, l 链接)     │
│                                                              │
│  权限数字表示：                                              │
│  r (read)    = 4                                             │
│  w (write)   = 2                                             │
│  x (execute) = 1                                             │
│  - (none)    = 0                                             │
│                                                              │
│  常见权限：                                                  │
│  755 = rwxr-xr-x (目录、可执行文件)                         │
│  644 = rw-r--r-- (普通文件)                                 │
│  600 = rw------- (私密文件)                                 │
│  777 = rwxrwxrwx (所有权限)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```bash
# chmod 修改权限
chmod 755 file          # 数字方式
chmod u+x file          # 给所有者添加执行权限
chmod g-w file          # 移除组的写权限
chmod o=r file          # 其他用户只读
chmod a+x file          # 所有人添加执行权限
chmod -R 755 dir        # 递归修改目录权限

# chown 修改所有者
chown user file                 # 修改所有者
chown user:group file           # 修改所有者和组
chown -R user:group dir         # 递归修改

# chgrp 修改组
chgrp group file        # 修改文件组
chgrp -R group dir      # 递归修改

# 特殊权限
chmod u+s file          # SUID（执行时以所有者身份运行）
chmod g+s dir           # SGID（目录下新文件继承组）
chmod +t dir            # Sticky Bit（只有所有者可删除）

# umask 默认权限掩码
umask                   # 查看当前 umask
umask 022               # 设置 umask（新文件权限 = 666 - umask）
```

---

#### 4. 用户与组管理

```bash
# 用户管理
useradd username                # 创建用户
useradd -m username             # 创建用户并创建主目录
useradd -s /bin/bash username   # 指定 shell
userdel username                # 删除用户
userdel -r username             # 删除用户及主目录
usermod -l newname oldname      # 修改用户名
usermod -aG group username      # 将用户添加到组
passwd username                 # 设置密码

# 组管理
groupadd groupname      # 创建组
groupdel groupname      # 删除组
groupmod -n new old     # 修改组名

# 查看信息
id username             # 查看用户 ID 和组信息
whoami                  # 当前用户名
who                     # 当前登录用户
w                       # 详细登录信息
last                    # 登录历史
groups username         # 用户所属组

# 切换用户
su username             # 切换用户
su - username           # 切换用户并加载环境
sudo command            # 以 root 执行命令
sudo -u user command    # 以指定用户执行
```

---

#### 5. 进程管理

```bash
# 查看进程
ps                      # 当前终端进程
ps aux                  # 所有进程详细信息
ps -ef                  # 所有进程（标准格式）
ps aux | grep nginx     # 查找特定进程

# top/htop 实时监控
top                     # 实时进程监控
htop                    # 增强版（需安装）
# top 中: q退出, k杀进程, P按CPU排序, M按内存排序

# 进程控制
kill PID                # 发送 SIGTERM（温和终止）
kill -9 PID             # 发送 SIGKILL（强制终止）
kill -15 PID            # 发送 SIGTERM
killall nginx           # 按名称杀进程
pkill -f "pattern"      # 按模式杀进程

# 后台运行
command &               # 后台运行
nohup command &         # 后台运行，忽略挂断信号
nohup command > output.log 2>&1 &  # 输出重定向

# jobs/fg/bg
jobs                    # 查看后台任务
fg %1                   # 将任务1调至前台
bg %1                   # 将任务1放入后台
Ctrl+Z                  # 暂停当前进程
Ctrl+C                  # 终止当前进程

# 查看端口
lsof -i :80             # 查看占用80端口的进程
netstat -tlnp           # 查看监听端口
ss -tlnp                # 查看监听端口（新版）
```

---

### 进阶题

#### 6. 网络命令

```bash
# 网络配置
ifconfig                # 查看网络接口（旧）
ip addr                 # 查看网络接口（新）
ip link                 # 查看网络接口状态
ip route                # 查看路由表

# 网络测试
ping host               # 测试连通性
ping -c 4 host          # 发送4个包
traceroute host         # 追踪路由
mtr host                # 实时追踪

# DNS
nslookup domain         # DNS 查询
dig domain              # 详细 DNS 查询
host domain             # 简单 DNS 查询

# 端口测试
telnet host port        # 测试端口连通
nc -zv host port        # netcat 测试端口
curl -v host:port       # HTTP 测试

# 下载
wget url                # 下载文件
wget -O filename url    # 指定文件名
wget -c url             # 断点续传
curl url                # 获取内容
curl -o file url        # 下载文件
curl -X POST -d "data" url  # POST 请求

# 网络统计
netstat -an             # 所有连接
netstat -tlnp           # TCP 监听端口
ss -s                   # 连接统计
ss -tlnp                # TCP 监听端口

# 防火墙
iptables -L             # 查看规则
iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # 允许80端口
firewall-cmd --list-all                        # firewalld 查看规则
firewall-cmd --add-port=80/tcp --permanent     # 开放端口
```

---

#### 7. 磁盘与存储

```bash
# 磁盘使用
df -h                   # 查看磁盘使用（人性化显示）
df -i                   # 查看 inode 使用

# 目录大小
du -sh dir              # 目录总大小
du -h dir               # 各子目录大小
du -sh * | sort -h      # 按大小排序

# 磁盘分区
fdisk -l                # 查看分区
fdisk /dev/sda          # 分区操作
lsblk                   # 查看块设备

# 挂载
mount /dev/sdb1 /mnt    # 挂载分区
umount /mnt             # 卸载
mount -o remount,rw /   # 重新挂载为读写

# 文件系统
mkfs.ext4 /dev/sdb1     # 格式化为 ext4
mkfs.xfs /dev/sdb1      # 格式化为 xfs
fsck /dev/sdb1          # 文件系统检查

# /etc/fstab 自动挂载
# /dev/sdb1  /data  ext4  defaults  0  0
```

---

#### 8. 压缩与归档

```bash
# tar 归档
tar -cvf archive.tar files      # 创建归档
tar -xvf archive.tar            # 解压归档
tar -tvf archive.tar            # 查看内容

# tar + gzip (.tar.gz / .tgz)
tar -czvf archive.tar.gz files  # 压缩
tar -xzvf archive.tar.gz        # 解压
tar -xzvf archive.tar.gz -C dir # 解压到指定目录

# tar + bzip2 (.tar.bz2)
tar -cjvf archive.tar.bz2 files # 压缩
tar -xjvf archive.tar.bz2       # 解压

# tar + xz (.tar.xz)
tar -cJvf archive.tar.xz files  # 压缩
tar -xJvf archive.tar.xz        # 解压

# gzip
gzip file                       # 压缩（删除原文件）
gzip -k file                    # 压缩（保留原文件）
gunzip file.gz                  # 解压

# zip
zip archive.zip files           # 压缩
zip -r archive.zip dir          # 压缩目录
unzip archive.zip               # 解压
unzip archive.zip -d dir        # 解压到指定目录
unzip -l archive.zip            # 查看内容
```

---

#### 9. 系统管理

```bash
# 系统信息
uname -a                # 内核信息
uname -r                # 内核版本
cat /etc/os-release     # 系统版本
hostname                # 主机名
uptime                  # 运行时间和负载

# 内存
free -h                 # 内存使用
free -m                 # MB 显示
cat /proc/meminfo       # 详细内存信息

# CPU
lscpu                   # CPU 信息
cat /proc/cpuinfo       # 详细 CPU 信息
nproc                   # CPU 核心数

# 系统负载
uptime                  # 负载平均值
top                     # 实时监控
vmstat 1                # 虚拟内存统计
iostat 1                # I/O 统计
sar                     # 系统活动报告

# 服务管理 (systemd)
systemctl start service         # 启动服务
systemctl stop service          # 停止服务
systemctl restart service       # 重启服务
systemctl status service        # 查看状态
systemctl enable service        # 开机启动
systemctl disable service       # 禁止开机启动
systemctl list-units            # 列出所有服务
journalctl -u service           # 查看服务日志
journalctl -f                   # 实时查看系统日志

# 定时任务 (crontab)
crontab -l                      # 查看定时任务
crontab -e                      # 编辑定时任务
crontab -r                      # 删除定时任务

# cron 格式
# 分 时 日 月 周 命令
# *  *  *  *  *  command
# 0  2  *  *  *  /backup.sh     # 每天2点
# */5 *  *  *  *  /check.sh     # 每5分钟
# 0  0  1  *  *  /monthly.sh    # 每月1号

# 日志
tail -f /var/log/syslog         # 系统日志
tail -f /var/log/messages       # 系统消息
tail -f /var/log/nginx/access.log  # Nginx 访问日志
dmesg                           # 内核日志
```

---

#### 10. Shell 脚本基础

```bash
#!/bin/bash

# 变量
name="John"
echo "Hello, $name"
echo "Hello, ${name}!"

# 特殊变量
$0          # 脚本名
$1, $2...   # 位置参数
$#          # 参数个数
$@          # 所有参数（数组）
$*          # 所有参数（字符串）
$?          # 上一命令退出码
$$          # 当前进程 PID

# 条件判断
if [ -f file ]; then
    echo "file exists"
elif [ -d dir ]; then
    echo "dir exists"
else
    echo "not found"
fi

# 文件测试
-f file     # 文件存在
-d dir      # 目录存在
-e path     # 路径存在
-r file     # 可读
-w file     # 可写
-x file     # 可执行
-s file     # 文件非空

# 字符串测试
-z "$str"   # 字符串为空
-n "$str"   # 字符串非空
"$a" = "$b" # 字符串相等
"$a" != "$b" # 字符串不等

# 数字比较
-eq         # 等于
-ne         # 不等于
-lt         # 小于
-le         # 小于等于
-gt         # 大于
-ge         # 大于等于

# 循环
for i in 1 2 3; do
    echo $i
done

for file in *.txt; do
    echo $file
done

for ((i=0; i<10; i++)); do
    echo $i
done

while [ $count -lt 10 ]; do
    echo $count
    ((count++))
done

# 函数
function greet() {
    echo "Hello, $1"
    return 0
}
greet "World"

# 读取输入
read -p "Enter name: " name
echo "Hello, $name"

# 数组
arr=(a b c d)
echo ${arr[0]}      # 第一个元素
echo ${arr[@]}      # 所有元素
echo ${#arr[@]}     # 数组长度

# 命令替换
date=$(date +%Y-%m-%d)
files=`ls -la`

# 管道和重定向
command > file      # 输出重定向（覆盖）
command >> file     # 输出重定向（追加）
command 2> file     # 错误重定向
command 2>&1        # 错误合并到标准输出
command < file      # 输入重定向
command1 | command2 # 管道
```

---

### 避坑指南

| 危险命令 | 说明 |
|----------|------|
| `rm -rf /` | 删除整个系统 |
| `rm -rf *` | 删除当前目录所有文件 |
| `chmod -R 777 /` | 权限全开（安全问题） |
| `dd if=/dev/zero of=/dev/sda` | 清空硬盘 |
| `:(){ :\|:& };:` | Fork 炸弹 |
| `> /etc/passwd` | 清空密码文件 |

**安全建议：**
- 使用 `rm` 前先 `ls` 确认
- 重要操作先备份
- 使用 `alias rm='rm -i'` 添加确认
- 避免在 root 下操作

---

## B. 实战文档

### 日志分析

```bash
# 访问量统计
cat access.log | wc -l

# 统计独立 IP
awk '{print $1}' access.log | sort | uniq | wc -l

# IP 访问排行
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 访问最多的 URL
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# 按小时统计访问量
awk '{print substr($4,14,2)}' access.log | sort | uniq -c

# 404 错误统计
awk '$9==404 {print $7}' access.log | sort | uniq -c | sort -rn

# 查找慢请求
awk '$NF>1 {print $0}' access.log

# 实时监控错误日志
tail -f error.log | grep -E "error|Error|ERROR"
```

### 常用脚本模板

```bash
#!/bin/bash

# 备份脚本
BACKUP_DIR="/backup"
SOURCE_DIR="/data"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czvf ${BACKUP_DIR}/backup_${DATE}.tar.gz ${SOURCE_DIR}

# 保留最近7天备份
find ${BACKUP_DIR} -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_${DATE}.tar.gz"
```

```bash
#!/bin/bash

# 系统监控脚本
THRESHOLD=80
EMAIL="admin@example.com"

# 检查 CPU 使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
if [ $CPU_USAGE -gt $THRESHOLD ]; then
    echo "CPU usage: $CPU_USAGE%" | mail -s "CPU Alert" $EMAIL
fi

# 检查内存使用率
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt $THRESHOLD ]; then
    echo "Memory usage: $MEM_USAGE%" | mail -s "Memory Alert" $EMAIL
fi

# 检查磁盘使用率
DISK_USAGE=$(df -h / | tail -1 | awk '{print int($5)}')
if [ $DISK_USAGE -gt $THRESHOLD ]; then
    echo "Disk usage: $DISK_USAGE%" | mail -s "Disk Alert" $EMAIL
fi
```

### 快捷键

```
Ctrl + A    移动到行首
Ctrl + E    移动到行尾
Ctrl + U    删除到行首
Ctrl + K    删除到行尾
Ctrl + W    删除前一个单词
Ctrl + R    搜索历史命令
Ctrl + L    清屏
Ctrl + C    终止当前命令
Ctrl + Z    暂停当前命令
Ctrl + D    退出当前 shell
Tab         自动补全
↑/↓         历史命令
```
