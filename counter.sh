#!/bin/bash

#first attribute, it gets the totalImages
#totalSize=$2;
#second attribute, it gets the number of columns from the painting
#totalColumn=$3;
#iterate over totalImages
#for((i=0;i<=$totalSize;i++));
#do
   #print the current position
#   echo "$i.jpg";
#done
# attribute to get and move to the directory where all images are stored
cd $1
#single line magick full command
magick montage `totalSize=$2; for((i=0;i<=$totalSize;i++)); do echo "$i.jpg"; done` -mode Concatenate -tile $3x $1.jpg
#single line full counter code
#totalSize=$2; totalColumn=$3; for((i=0;i<=$totalSize;i++)); do echo "$i.jpg"; done
