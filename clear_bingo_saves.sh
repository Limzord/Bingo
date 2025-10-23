#!/bin/bash
RUN_DIR=$(cd $(dirname $0) && pwd)
SAVE_DIR=""$RUN_DIR"/saves"
find "$SAVE_DIR" -type f -name '*.json' -delete
