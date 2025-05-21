#!/bin/bash

read -p "Movie Title : " title

read -p "What Is Media Type (say 0 For Series, 1 For Movie) : " movie_type

if [[ "$movie_type" == 0 ]]; then
    echo "Not Implemented Yet"
elif [[ "$movie_type" == 1 ]]; then
    echo "MongoDB Insertion"
    INSERT='{ Title: "'$title'", Category: "Movies", Favourite: false }'
    OUTPUT=$(mongosh --port 27020 --quiet --eval "db.getSiblingDB('movie_database').All.insertOne($INSERT)")
    echo "MongoDB Output : $OUTPUT"

    ID=$(echo "$OUTPUT" | grep -o "ObjectId('[^']*')" | sed "s/ObjectId('//g" | sed "s/')//g")
    echo "Movie ID : $ID"

    echo "Check Raw Video Metadata"
    ffprobe -i "$1" -v quiet -show_streams -select_streams v
    
    echo "Check Raw Audio Metadata"
    ffprobe -i "$1" -v quiet -show_streams -select_streams a

    read -p "How Many Audio Do You Want? : " num

    AUDIO_COMMAND="ffmpeg -i '$1'"

    for ((i=1; i<=num; i++)); do
        echo "Iteration : $i"
        while true; do
            read -p "What Is The Language (say hindi, english, ...) : " language
            read -p "What Is Stream Code (say 0, 1, ...) : " code
            read -p "Short Code (say audio_hin, audio_en, ...) : " short_code
            read -p "Long Code (say Audio_Hindi, Audio_English, ...) : " long_code
            read -p "Title (say Hindi, English, ...) : " title

            echo -e "\nCheck What You Entered : "
            echo "Language : $language"
            echo "Stream Code : $code"
            echo "Short Code : $short_code"
            echo "Long Code : $long_code"
            echo "Title : $title"

            read -p "Do You Want To Redo The Input? (say y For Yes, n For No): " redo
            if [[ "$redo" != "y" ]]; then
                break
            fi
        done
    
        mkdir -p "$ID/$long_code"
    
        AUDIO_COMMAND+=" \
        -map 0:a:$code -c:a aac -ac 6 -metadata:s:a:$code language=$language -metadata:s:a:$code title=\"$title\" \
        -hls_base_url \"/chunk/$ID/$short_code/\" \
        -hls_segment_filename \"$ID/$long_code/segment_%03d.ts\" \
        -f hls -hls_time 20 -hls_list_size 0 -hls_playlist_type vod \"$ID/${long_code,,}.m3u8\""
    done

    subtitle_info=$(ffprobe -i "$1" -v quiet -show_streams -select_streams s)

    if [[ -z "$subtitle_info" ]]; then
        echo "No Subtitle Found"
    else
        echo "Check Raw Subtitle Metadata"
        read -p "Select English Subtitle : " eng_sub_code
        SUBTITLE_COMMAND="ffmpeg -i "$1" -map 0:s:$eng_sub_code -c:s webvtt '$ID/subtitles_en.vtt'"
    fi

    echo "Making Directory $ID"
    mkdir -p "$ID/Video"

    echo "Extracting Video"
    ffmpeg -i "$1" \
    -map 0:v -c:v libx264 -preset slow -crf 23 -vf format=yuv420p \
    -an -sn \
    -map_metadata -1 \
    -hls_segment_type mpegts \
    -hls_flags iframes_only \
    -hls_base_url "/chunk/$ID/video/" \
    -hls_segment_filename "$ID/Video/segment_%03d.ts" \
    -f hls -hls_time 20 -hls_list_size 0 -hls_playlist_type vod "$ID/video.m3u8"
    echo "Done Extracting Video"

    echo "Extracting Audio"
    eval "$AUDIO_COMMAND"
    echo "Done Extracting Audio"

    if [[ -n "$SUBTITLE_COMMAND" ]]; then
        echo "Extracting Subtitle"
        eval "$SUBTITLE_COMMAND"
        echo "Done Extracting Subtitle"
    fi

    mkdir "$ID/Previews"
    cd "$ID/Previews"

    echo "Generating Thumbnails From Video"
    ffmpeg -i ./../../"$1" -vf 'fps=1/5,scale=-1:180,tile=2*2' thumb_minute_%03d_grid.jpg

    minute_counter=0
    second_counter=1
    index=1
    for file in thumb_minute_*.jpg; do
        if [[ $index -gt 1 && $((index % 3)) -eq 1 ]]; then  
            minute_counter=$((minute_counter + 1))
            second_counter=1
        fi
        new_filename="thumb_minute_${minute_counter}_${second_counter}_grid.jpg"
        mv "$file" "$new_filename"

        second_counter=$((second_counter + 1))
        index=$((index + 1))
    done
    cd ./../..
    echo "Completed! Your Folder Is $ID"
else
    echo "Type Not Defined"
fi