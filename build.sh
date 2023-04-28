#!/bin/bash
OUTPUT_DIR="output"

if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir "$OUTPUT_DIR"
else
  for dirname in lib public
    do
      if [ -d "$OUTPUT_DIR/$dirname" ]; then
        rm -rf $OUTPUT_DIR/$dirname
      fi
    done
fi

cd web
npm run build

cd ../api
npm run build

cd ..
#echo `pwd`
mv api/dist $OUTPUT_DIR/lib
mv web/dist $OUTPUT_DIR/public

# 循环复制单个文件
for file in package.json app.yml
  do
    cp api/$file $OUTPUT_DIR/$file
  done

scp -r output/* root@192.168.114.169:/home/chc/meeting-room