function zeitEingeben (zeichenCode: number) {
    if (pins.between(zeichenCode, 48, 57)) {
        ziffer = zeichenCode - 48
        if (zahl < 10) {
            zahl = zahl * 10 + ziffer
        } else {
            zahl = ziffer
        }
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 13, 15, zahl, lcd16x2rgb.eAlign.right)
        return true
    } else {
        return false
    }
}
pins.onKeyboardEvent(function (zeichenCode, zeichenText, isASCII) {
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 9, 9, lcd16x2rgb.lcd16x2_text(zeichenText))
    if (ledButton) {
        zeitWahl(zeichenCode, zeichenText)
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 14, 15, zeitRegister[zeitIndex])
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 11, 12, rtcpcf85063tp.getByte(zeitIndex, rtcpcf85063tp.eFormat.DEC))
        zeitNeu = zeitEingeben(zeichenCode)
    }
})
function zeitWahl (zeichenCode: number, zeichenText: string) {
    if ((zeichenText == "*" || zeichenCode == 180) && zeitIndex > 0) {
        zeitSpeichern()
        zeitIndex += -1
    } else if ((zeichenText == "#" || zeichenCode == 183) && zeitIndex < 6) {
        zeitSpeichern()
        zeitIndex += 1
    } else if (zeichenCode == 27) {
        pins.comment(pins.pins_text("ESC Taste"))
        zeitNeu = false
    }
}
function zeitSpeichern () {
    if (zeitNeu) {
        rtcpcf85063tp.writeDateTime(rtcpcf85063tp.rtcpcf85063tp_eADDR(rtcpcf85063tp.eADDR.RTC_x51), zeitIndex, [zahl])
    }
}
function anzeigenSekunde () {
    rtcpcf85063tp.anzeige25LED(rtcpcf85063tp.e25LED.Zeit)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 7, lcd16x2rgb.lcd16x2_text(rtcpcf85063tp.getTime(rtcpcf85063tp.ePart.mit)))
}
function anzeigenMinute () {
    matrix.clearMatrix()
    matrix.writeClock(64, 63, 63, rtcpcf85063tp.getByte(rtcpcf85063tp.rtcpcf85063tp_eRegister(rtcpcf85063tp.eRegister.Stunde), rtcpcf85063tp.eFormat.DEC), rtcpcf85063tp.getByte(rtcpcf85063tp.rtcpcf85063tp_eRegister(rtcpcf85063tp.eRegister.Minute), rtcpcf85063tp.eFormat.DEC))
    matrix.displayMatrix()
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 12, rtcpcf85063tp.getDate(rtcpcf85063tp.ePart.mit, rtcpcf85063tp.ePart.mit))
}
pins.onPulsed(DigitalPin.C17, PulseValue.Low, function () {
    if (pins.pulseDuration() > 10000) {
        ledButton = !(ledButton)
    }
    pins.pinDigitalWrite(pins.pins_eDigitalPins(pins.eDigitalPins.C16), !(ledButton))
    if (!(ledButton)) {
        eingabeEnde = true
    }
})
let eingabeEnde = false
let ziffer = 0
let zeitIndex = 0
let zeitNeu = false
let zahl = 0
let ledButton = false
let zeitRegister: string[] = []
rtcpcf85063tp.beimStart(rtcpcf85063tp.rtcpcf85063tp_eADDR(rtcpcf85063tp.eADDR.RTC_x51))
matrix.init(matrix.ePages.y128)
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
zeitRegister = [
"ss",
"mm",
"HH",
"dd",
"dw",
"MM",
"yy"
]
pins.pinDigitalWrite(pins.pins_eDigitalPins(pins.eDigitalPins.C16), !(ledButton))
zahl = 0
zeitNeu = false
zeitIndex = 6
anzeigenMinute()
loops.everyInterval(200, function () {
    rtcpcf85063tp.readDateTime(rtcpcf85063tp.rtcpcf85063tp_eADDR(rtcpcf85063tp.eADDR.RTC_x51))
    if (rtcpcf85063tp.isChanged(rtcpcf85063tp.rtcpcf85063tp_eRegister(rtcpcf85063tp.eRegister.Minute))) {
        anzeigenMinute()
    } else if (rtcpcf85063tp.isChanged(rtcpcf85063tp.rtcpcf85063tp_eRegister(rtcpcf85063tp.eRegister.Sekunde))) {
        anzeigenSekunde()
    } else if (eingabeEnde) {
        eingabeEnde = false
        zeitNeu = false
        zahl = 0
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 14, 15, lcd16x2rgb.lcd16x2_text(""))
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 9, 15, lcd16x2rgb.lcd16x2_text(""))
    }
    pins.raiseKeyboardEvent(true)
    pins.raiseKeypadEvent(true)
})
