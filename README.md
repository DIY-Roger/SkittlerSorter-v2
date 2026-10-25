# Skittles Sorter V2

This repository contains the Arduino code for the improved Skittles Sorter V2.

The Skittles Sorter is a 3D printed machine that detects and sorts candy by color. It was originally developed as an educational project to introduce primary school children to technology in a practical and engaging way.

Version 2 builds on that foundation with a series of practical improvements based on real-world use in classrooms and during open days.

## What’s new in V2

This is not a complete redesign, but a refined version of the original:

* Faster operation
* Smoother mechanical flow
* Improved reliability
* Better suited for repeated use in demos and education
* Practical improvements like removable candy containers

## What the code does

The Arduino controls the full sorting process:

* Rotates the turntable using a stepper motor
* Detects the color of each Skittle using a TCS3200 color sensor
* Processes and maps detected colors
* Controls multiple servos via a PCA9685 driver
* Directs each Skittle to the correct output
* Includes serial commands for testing and validation

## Hardware used

* Arduino Uno R3
* PCA9685 servo driver board
* TCS3200 color sensor
* Stepper motor with driver
* Servo motors
* 3D printed mechanical parts

## Arduino libraries

Install the following library in the Arduino IDE:

* Adafruit PWM Servo Driver Library

## Serial commands

The code includes basic serial commands for testing:

```text
test [servo number] [repeat count]
validate
turn

## Build guide

An interactive, step-by-step 3D build guide (English) lives in `Handleiding/web` and is published at
https://diy-roger.com/projects/skittle-sorter/handleiding/ . Print files: https://makerworld.com/en/models/2753363-skittler-sorter-v2
