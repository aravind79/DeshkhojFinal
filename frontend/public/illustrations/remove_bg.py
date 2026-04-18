from PIL import Image
import os
import glob

def make_white_transparent(image_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    # Threshold for what is considered "white"
    # We want to be careful not to remove light-colored elements of the illustration itself
    # but the background is usually pure white (255, 255, 255)
    threshold = 245
    
    for item in datas:
        # If the pixel is very close to white, make it transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(image_path, "PNG")
    print(f"Processed {os.path.basename(image_path)}")

illustrations_path = r"e:\WORKS\zyt\DeshKhoj-Code-Reference\frontend\public\illustrations"
pattern = os.path.join(illustrations_path, "*.png")

for file_path in glob.glob(pattern):
    make_white_transparent(file_path)

print("All icons processed.")
