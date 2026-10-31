#!/usr/bin/env python3
"""Rebuilds app/fonts/archivo-kroj.woff2: Archivo variable, glyph-subset for Bosnian, axes narrowed.
Requires: pip install fonttools brotli. Uses the Google Fonts `text=` API to fetch a glyph subset."""
import urllib.parse, urllib.request, re, io, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CHARS = ''.join(chr(c) for c in range(32, 127)) + 'čćđšžČĆĐŠŽ–—„“”‘’·•…×°€→←−éÉüöäßñ «»©®'
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()

css = get('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&text=' + urllib.parse.quote(CHARS)).decode()
font = TTFont(io.BytesIO(get(re.findall(r'url\((https://[^)]+)\)', css)[0])))
font = instancer.instantiateVariableFont(font, {'wght': (400, 800), 'wdth': (62, 112)})
font.flavor = 'woff2'
out = pathlib.Path(__file__).resolve().parents[2] / 'app/fonts/archivo-kroj.woff2'
font.save(out)
print(out, out.stat().st_size, 'bytes')
