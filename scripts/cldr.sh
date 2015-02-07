#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [ ! -f $DIR/tmp-cldr/supplemental/plurals.json ]
  then
    echo "Fetching CLDR data from unicode.org"
    mkdir -p $DIR/tmp-cldr
    cd $DIR/tmp-cldr
    curl http://unicode.org/Public/cldr/26.0.1/json-full.zip > json.zip
    unzip -q json.zip
    rm json.zip
  else
    echo "Using cached CLDR data at $DIR/tmp-cldr"
fi

cd $DIR
../node_modules/.bin/6to5-node --loose=all cldr.js

