"""
Genera el QR en alta resolución para la señalética/carteles del objeto 3D AR
del evento de reinducción (usar qr-generator.html para vistas previas rápidas
o variantes de color; este script es para impresión grande).

Uso:
    pip install qrcode[pil]
    python scripts/generar_qr.py https://tu-usuario.github.io/0_Objetos_AR/

Genera qr_objetos_ar.png en el directorio actual.
"""
import sys

import qrcode


def generar_qr(url: str, salida: str = "qr_objetos_ar.png") -> None:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=20, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(salida)
    print(f"QR generado: {salida} -> {url}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/generar_qr.py <url-publica>")
    generar_qr(sys.argv[1])
