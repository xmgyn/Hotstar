#!/bin/bash

read -p "What Is Media Type (say 0 For Series, 1 For Movie, 2 For Cleanup) : " media_type

if [[ "$media_type" == 0 ]]; then
    while true; do
        read -p "Series Title : " series_title
        read -p "18+ Series? (say y For Yes, n For No) : " series_rating
        R_value=false
        if [[ "$series_rating" == "y" ]]; then
            R_value=true
        fi
        while true; do
            read -p "Seasons : " season_num
            if [[ "$season_num" =~ ^[1-9][0-9]*$ ]]; then
                break
            fi
        done
        series_tags=()
        for ((i=1; i<=3; i++)); do
            read -p "Enter Tag $i : " tag
            series_tags+=("$tag")
        done

        seasons=()

        for ((s=1; s<=season_num; s++)); do
            declare -A season_data
            read -p "Enter Season $s Name : " season_data["name"]
            read -p "Release Year (say 1960, 2001, ...) : " season_data["year"]

            while true; do
                read -p "Episode Count : " episode_count
                if [[ "$episode_count" =~ ^[1-9][0-9]*$ ]]; then
                    break
                fi
            done

            episodes=()

            for ((e=1; e<=episode_count; e++)); do
                declare -A episode_data
                read -p "Episode $e Name : " episode_data["name"]
                read -p "Duration (say In Minutes 160, 174, ...) : " episode_data["duration"]
                episodes+=("${episode_data[name]} (${episode_data[duration]} mins)")
            done

            season_data["episodes"]="${episodes[@]}"
            seasons+=("${s} = ${season_data[name]} = ${season_data[year]} == ${season_data[episodes]}")
        done

        echo "**Confirmation:**"
        echo "Series Title : ${series_title}"
        echo "18+ Series : ${R_value}"
        echo "Tags : ${series_tags[@]}"
        echo "Seasons :"
        for season in "${seasons[@]}"; do
            echo "- $season"
        done

        read -p "All Correct? (say y For Yes, n For No): " redo
        if [[ "$redo" == "y" ]]; then
            break
        fi
    done

    echo "MongoDB Insertion"
    INSERT='{ Title: "'$series_title'", Category: "Series", Favourite: false }'
    OUTPUT=$(mongosh --port 27020 --quiet --eval "JSON.stringify(db.getSiblingDB('movie_database').All.insertOne($INSERT))")
    echo "MongoDB Output : $OUTPUT"
    ID=$(echo "$OUTPUT" | jq -r '.insertedId')
    echo "Series ID : $ID"

    tags_array=$(printf ' "%s",' "${series_tags[@]}")
    tags_array="[${tags_array%,}]"
    INSERT='{ "_id": ObjectId("'$ID'"), "Title": "'$series_title'", "Seasons": {'
    for ((s=0; s<season_num; s++)); do  # Adjusted index to properly iterate over array
        INSERT+='"'$((s+1))'": { "Name": "'"${seasons[s]%% (*}"'", "Year": '"${seasons[s]##*(}"', "Episodes": {'
        for ((e=0; e<episode_count; e++)); do
            INSERT+='"'$((e+1))'": { "Name": "'"${episodes[e]%% (*}"'", "Duration": '"${episodes[e]##*(}"', "_id": { "$oid": "'"${episode_id[e]}"'" } },'
        done
        INSERT=${INSERT%,}  
        INSERT+='}, "_id": { "$oid": "'"${season_id[s]}"'" } },'
    done
    INSERT=${INSERT%,}  
    INSERT+='}, "Tags": '$tags_array', "R": '$R_value' }'
    
#    db.collection.insertOne({
#    name: "Parent Object",
#    children: [
#        { _id: new ObjectId(), name: "Child 1", age: 10 },
#        { _id: new ObjectId(), name: "Child 2", age: 12 }
#    ]
#});

      

    echo "Series Insertion : $INSERT"

    #OUTPUT=$(mongosh --port 27020 --quiet --eval "db.getSiblingDB('movie_database').Series.insertOne($INSERT)")
    #echo "MongoDB Output : $OUTPUT"    
elif [[ "$media_type" == 1 ]]; then
    read -p "How Many Movies To Process : " movie_count
    declare -a movie_list
    for ((j=1; j<=movie_count; j++)); do
        declare -A movie
        
        echo -e "\n\nCheck Files Names\n"
        ls | grep -E 'mkv|mp4'
        echo -e "\n\n"
        read -p "Enter Movie Filename $j: " movie["filename"]
        while true; do
            read -p "Movie Title : " movie["movie_title"]
            read -p "Release Year (say 1960, 2001, ...) : " movie["movie_year"]
            read -p "Duration (say In Minutes 160, 174, ...) : " movie["movie_duration"]
            read -p "18+ Movie? (say y For Yes, n For No) : " movie_rating
            movie["R_value"]=false
            if [[ "$movie_rating" == "y" ]]; then
                movie["R_value"]=true
            fi
            movie_tags=()
            for ((i=1; i<=3; i++)); do
                read -p "Enter Tag $i : " tag
                movie_tags+=("$tag")
            done
            movie["movie_tags"]="${movie_tags[*]}"
                
            echo "**Confirmation:**"
            echo "Movie Title : ${movie["movie_title"]}"
            echo "Release Year : ${movie["movie_year"]}"
            echo "Duration : ${movie["movie_duration"]} Minutes"
            echo "18+ Movie : ${movie["R_value"]}"
            echo "Tags: ${movie["movie_tags"]}"
        
            read -p "All Correct? (say y For Yes, n For No): " redo
            if [[ "$redo" == "y" ]]; then
                break
            fi
        done
            
        echo "MongoDB Insertion"
        INSERT='{ Title: "'${movie["movie_title"]}'", Category: "Movies", Favourite: false }'
        OUTPUT=$(mongosh --port 27020 --quiet --eval "db.getSiblingDB('movie_database').All.insertOne($INSERT)")
        echo "MongoDB Output : $OUTPUT"
        ID=$(echo "$OUTPUT" | grep -o "ObjectId('[^']*')" | sed "s/ObjectId('//g" | sed "s/')//g")
        movie["ID"]=$ID
        echo "Movie ID : ${movie["ID"]}"
        
        tags_array=$(printf '"%s", ' "${movie_tags[@]}")
        tags_array="[${tags_array%, }]"
        INSERT='{ "_id": ObjectId("'${movie["ID"]}'"), "Title": "'${movie["movie_title"]}'", "Duration": '${movie["movie_duration"]}', "Year": '${movie["movie_year"]}', "Tags": '$tags_array', "R": '${movie["R_value"]}' }'
        echo "Movie Insertion : $INSERT"

        OUTPUT=$(mongosh --port 27020 --quiet --eval "db.getSiblingDB('movie_database').Movies.insertOne($INSERT)")
        echo "MongoDB Output : $OUTPUT"
        
    
        echo "Check All Streams Available"
        ffprobe -i "${movie["filename"]}" |& grep Stream

        read -p "Do You Want To Check Raw Video Metadata? (say y For Yes, n For No ): " video_choice
        if [[ $video_choice == "y" ]]; then
            echo "Checking Raw Video Metadata..."
            ffprobe -hide_banner -i "${movie["filename"]}" -v quiet -show_streams -select_streams v
        fi
        read -p "Do You Want To Check Raw Audio Metadata? (say y For Yes, n For No ): " audio_choice
        if [[ $audio_choice == "y" ]]; then
            echo "Checking Raw Audio Metadata..."
            ffprobe -hide_banner -i "${movie["filename"]}" -v quiet -show_streams -select_streams a
        fi

        while true; do
            read -p "How Many Audio Do You Want? : " num
            if [[ "$num" =~ ^[1-9][0-9]*$ ]]; then
                break
            fi
        done
        movie["AUDIO_COUNT"]=$num

        echo "Check Audio Streams Available"
        ffmpeg -i "${movie["filename"]}" 2>&1 | awk '/Audio:/ {print "Stream #0:" audio_count ":", $0; audio_count++}' audio_count=0

        audio_folders=()
        AUDIO_COMMAND="ffmpeg -hide_banner -i "${movie["filename"]}""

        for ((i=1; i<=num; i++)); do
            echo "Enter Details For Audio $i"
            while true; do
                read -p "What Is The Language (say hindi, english, ...) : " language
                read -p "What Is Audio Stream Code (say 0, 1, ...) : " code
                read -p "Short Code (say audio_hin, audio_en, ...) : " short_code
                read -p "Long Code (say Audio_Hindi, Audio_English, ...) : " long_code
                read -p "Title (say Hindi, English, ...) : " title

                echo -e "\nCheck What You Entered : "
                echo "Language : $language"
                echo "Stream Code : $code"
                echo "Short Code : $short_code"
                echo "Long Code : $long_code"
                echo "Title : $title"

                read -p "All Correct? (say y For Yes, n For No): " redo
                if [[ "$redo" == "y" ]]; then
                    audio_folders+=("$long_code|$title")
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
        movie["audio_folders"]="${audio_folders[*]}"
        movie["AUDIO_COMMAND"]=$AUDIO_COMMAND

        subtitle_info=$(ffprobe -hide_banner -i "${movie["filename"]}" 2>&1 | awk '/Subtitle:/ {print "Stream #0:" sub_count ":", $0; sub_count++}' sub_count=0)

        movie["Details_Subtitle"]=true
        if [[ -z "$subtitle_info" ]]; then
            echo "No Subtitle Found"
            read -p "Do You Have Seperate Subtitle File (say y For Yes, n For No) : " have_sub
            if [[ "$have_sub" != "y" ]]; then
                movie["Details_Subtitle"]=false
            fi
        else
            echo "Check Subtitle"
            ffmpeg -i "${movie["filename"]}" -hide_banner |& grep -E 'Stream|Subtitle|DURATION'
            
            while true; do
                read -p "Select English Subtitle (Start Counting From First Subtitle, First One Is 0) : " eng_sub_code
                if [[ "$eng_sub_code" =~ ^[0-9][0-9]*$ ]]; then
                    break
                fi
            done
            movie["SUBTITLE_COMMAND"]="ffmpeg -i "${movie["filename"]}" -map 0:s:$eng_sub_code -c:s webvtt '$ID/subtitles_en.vtt'"
        fi
        movie_list+=("$(declare -p movie)")
    done
#Input Phase Ends

#Processing Phase Starts
    echo -e "\n\n\n\n\nProcessing Phase Starts, It May Take Hours So Come Back Later"
    for movie_data in "${movie_list[@]}"; do
        eval "$movie_data"  
        echo -e "\n\nProcessing ${movie["filename"]}..."
        echo "Details:"
        for key in "${!movie[@]}"; do
            echo "$key: ${movie[$key]}"
        done

        ID=${movie["ID"]}
        
        echo "Making Directory $ID"
        mkdir -p "$ID/Video"

        echo "Extracting Video"
        ffmpeg -hide_banner -i "${movie["filename"]}" \
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
        eval "${movie["AUDIO_COMMAND"]}"
        echo "Done Extracting Audio"

        if [[ -n "${movie["SUBTITLE_COMMAND"]}" ]]; then
            echo "Extracting Subtitle"
            eval "${movie["SUBTITLE_COMMAND"]}"
            echo "Done Extracting Subtitle"
        fi

        mkdir "$ID/Previews"
        cd "$ID/Previews"

        echo "Generating Thumbnails From Video"
        ffmpeg -hide_banner -i ./../../"${movie["filename"]}" -vf 'fps=1/5,scale=-1:180,tile=2*2' thumb_minute_%03d_grid.jpg

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
        cd ./../../
    done

#Processing Phase Ends
    echo -e "\n\n\n\n\nProcessing Phase Ended Successfully, Now Fill Some Details"
    for movie_data in "${movie_list[@]}"; do
        eval "$movie_data"  
        echo -e "\n\nProcessing ${movie["filename"]}..."

        ID=${movie["ID"]}
        IFS=' ' read -r -a audio_folders <<< "${movie["audio_folders"]}"
        cd ./$ID

        echo "Adding Media Details"
        while true; do
            ffprobe -hide_banner -i 'Video/segment_000.ts' |& grep 'Stream #0:0' 

            read -p "Enter Video Codec Details (say h264 (High) ([27][0][0][0] / 0x001B)) : " Details_codec
            read -p "Enter Color Details (say yuv420p(progressive)) : " Details_color
            read -p "Enter Resolution Details (say 1920x800 [SAR 1:1 DAR 12:5]) : " Details_resolution
            read -p "Enter FPS Details (say 24) : " Details_fps
            Details_Audio="["
        
            for ((i=1; i<=movie["AUDIO_COUNT"]; i++)); do
                IFS='|' read -r long_code title <<< "${audio_folders[i-1]}"
                echo "Enter Details For Audio $title"
                ffprobe -hide_banner -i "$long_code/segment_000.ts" |& grep 'Stream #0:0'
                ffprobe -hide_banner -i "$long_code/segment_000.ts" |& grep 'Stream #0:0' | awk '
                /Stream #0:0/ {
                    print $4, $5, $6, $7, $8;               # aac (LC) ([15][0][0][0] / 0x000F)
                    print $9;                               # 48000
                    print $11;                              # 5.1
                }'
                read -p "Enter Audio Codec Details (say aac (LC) ([15][0][0][0] / 0x000F)) : " Details_Audio_codec
                read -p "Enter Frequency Details (say 48000) : " Details_Audio_freq
                read -p "Enter Channel Details (say 5.1) : " Details_Audio_chan
                type_audio=$(echo "$long_code" | tr '[:upper:]' '[:lower:]')
                Details_Audio+="{ \"name\": \"$title\", \"codec\": \"$Details_Audio_codec\", \"frequency\": \"$Details_Audio_freq Hz\", \"channel\": \"$Details_Audio_chan\", \"type\": \"$type_audio\" },"
            done
        
            Details_Audio="${Details_Audio%,}]"
            INSERT='{ "_id": ObjectId("'$ID'"), "audio_profiles": '$Details_Audio', "subtitle": '${movie["Details_Subtitle"]}', "color_details": "'$Details_color'", "resolution": "'$Details_resolution'", "video_codec": "'$Details_codec'", "video_fps": "'$Details_fps' fps" }'

            echo "Check Details"
            echo "$INSERT"
        
            read -p "All Correct? (say y For Yes, n For No) : " redo
            if [[ "$redo" == "y" ]]; then
                break
            fi
        done
	
	cd ./../
        OUTPUT=$(mongosh --port 27020 --quiet --eval "db.getSiblingDB('movie_database').Details.insertOne($INSERT)")
        echo "MongoDB Output : $OUTPUT"
        echo "Completed! Your Folder Is $ID"
    done
elif [[ "$media_type" == 2 ]]; then
    read -p "Enter ID For Cleanup : " entry
    echo "Not Implemented"
    #if [[ "$entry" == "y" ]]; then
    #	read -p "Enter ID : " ID
    #elif [[ "$entry" == "n" ]]; then
    #fi
else
    echo "Type Not Defined"
fi
