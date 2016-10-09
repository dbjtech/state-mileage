# state-mileage

## 简介：

state-mileage是用来统计用户绑定终端号的车辆行驶的里程数的一个小程序，通过生成用户uid的xlsx文件匹配终端号tid的csv文件计算出来的里程数据来实现。

##准备步骤：

1. 用户把目录中的CN.zip,CA.zip,US.zip,US.z01,US.z02等原始数据下载下来并解压到travel目录下的raw文件夹中

1. 在`travel`根目录下找到`config.js`，用文本编辑器打开config.js并修改文件中  `city:'../raw/US.txt'` 这一行中`/`后面的文件名，例如用户想计算CN里程的数据则将US.txt改为CN.txt，修改完成后保存并关闭config.js文件

1. 用户在Mongodb官网下下载并安装好mongodb,安装完成后在cmd命令行中进入到mongodb安装目录下的`bin`文件夹，然后输入`mongod.exe`来运行mongodb

## 操作步骤：

1. 用户在cmd命令行窗口中进入到`travel`目录下，然后输入`npm install`来安装程序所依赖的模块 

1. 用户在cmd命令行窗口中切换到`travel`目录下的`index`文件夹，然后输入 `node city_indexer.js` 来索引txt中的城市数据

1. 用户在命令行中返回到travel目录，输入 `node main.js`来运行程序，执行程序后控制台输出该程序的正确使用方法是需要带参数指定路径的。
  1. 其中`-u`指定的是用户数据的原始数据文件的路径,`-o`指定的是从用户原始数据文件中分割出来的每个用户的xlsx文件的存放路径，`-l`指定的是每个用户的终端号的csv数据文件存放的路径。
  1. 例子：假如我的用户原始数据文件为`cloudhawkuid.csv`，存放在`raw`文件夹中，我想把分割出来的用户的Xlsx文件存放在当前目录（`travel`目录）中的`uid`文件夹（新建的文件夹）下，而用户终端号的csv文件存放在`travel`目录下的一个叫`locations`的文件夹中，
  
    则该命令应该这样输入：
    `node main.js -u ./raw/cloudhawkuid.csv -o ./uid/ -l ./locations/` （注意：每个参数后面都有空格再接路径）程序运行成功的话控制台会输出若干条 write succeed

  1. 此时进入`uid`文件夹下，可以看到有多个用户数据文件生成出来了，打开任意一个文件都可以看到用户使用的终端号在各个城市中的里程数据。到此程序运行成功并结束。


