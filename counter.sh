#!/bin/bash
# Declare the counter variable
#counter=0
# Loop through the numbers 1 to N and use i as iterator (but we are not going to use it)
#for i in {0..47}; do
   # Increment the counter variable
#   ((counter++))
   # Print the value of the counter variable
#   echo "$i.jpg"
#done
#single line magick full command
#magick montage `counter=0; for i in {0..47}; do ((counter++)); echo "$i.jpg"; done` -mode Concatenate -tile 6x result_montage.jpg
#single line full counter code
`counter=0; for i in {0..10}; do ((counter++)); echo "$i.jpg"; done`