# state-mileage
简介：

state-mileage是用来统计用户绑定终端号的车辆行驶的里程数的一个小程序，通过生成用户uid的xlsx文件匹配终端号tid的csv文件计算出来的里程数据来实现。

操作步骤：

1.用户把目录中的CN.zip,CA.zip,US.zip等原始数据下载下来并解压到travel目录下的raw文件夹中

2.在travel根目录下找到config.js，用文本编辑器打开config.js并修改文件中  city:'raw/US.txt' 这一行中/后面的文件名，例如用户想计算CN里程的数据则将US.txt改为CN.txt，修改完成后保存并关闭config.js文件

3.用户需安装好mongodb，在cmd命令行中进入到Mongodb安装目录下的bin文件夹，然后输入 mongod.exe 来运行Mongodb

4.用户打开cmd命令行窗口，进入到travel目录下的index文件夹，然后输入 node city_indexer.js 来索引txt中的城市数据

5.用户在命令行中返回到travel目录，输入 node main.js来运行程序，执行程序后控制台中输出该程序的正确使用方法是需要带参数指定路径的。其中-u指定的是用户数据的原始数据文件的路径,-o指定的是从用户原始数据文件中分割出来的每个用户的xlsx文件的存放路径，-l指定的是每个用户的终端号的csv数据文件存放的路径。
例子：假如我的用户原始数据文件为cloudhawkuid.csv，存放在raw文件夹中，我想把分割出来的用户的Xlsx文件存放在当前目录（travel目录）中的uid文件夹（新建的文件夹）下，而用户终端号的csv文件存放在travel目录下的一个叫locations的文件夹中，则该命令应该这样输入：
node main.js -u ./raw/cloudhawkuid.csv -o ./uid/ -l ./locations/   程序运行成功的话控制台会输出若干条 write succeed，此时进入uid文件夹下，可以看到有多个用户数据文件生成出来了，打开任意一个文件都可以看到用户终端号在各个城市中


