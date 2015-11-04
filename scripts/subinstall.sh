#!/usr/bin/env bash
CWD=`pwd`
for pkg in packages/*
do
  if [ -f "$CWD/$pkg/package.json" ];
  then
    echo "$pkg npm i"
    cd "$CWD/$pkg"
    npm i
  fi
done
cd $CWD
