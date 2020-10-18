import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import jimp from 'jimp';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import { triggerBase64Download } from 'react-base64-downloader';

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [zoom, setZoom] = useState(0.4);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState(1 / 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  useEffect(() => {
    const input = document.querySelector('input');

    input.addEventListener('change', () => {
      setUploadImage(URL.createObjectURL(input.files[0]));
      console.log(input.files);
    });
  }, []);

  const onCropComplete = (croppedArea, croppedAreaPixels) =>
    setCroppedAreaPixels(croppedAreaPixels);

  const overlayImage = async () => {
    try {
      const cropImage = await getCroppedImg(uploadImage, croppedAreaPixels);

      const image1 = await jimp.read('/frame.png');
      const frame = image1.resize(3840, 3840);

      const image2 = await jimp.read(cropImage);
      const profile = image2
        .resize(3840, 3840)
        .crop(384, 384, 3072, 3072)
        .greyscale();

      frame.composite(profile, 384, 384, {
        mode: jimp.BLEND_DESTINATION_OVER,
      });

      frame.getBase64(jimp.AUTO, async (err, src) => {
        setImgSrc(src);
        triggerBase64Download(src, 'download_name');
        console.log('its done');
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div
        style={{
          height: 512,
          overflow: 'hidden',
        }}
      >
        <Cropper
          image={uploadImage}
          minZoom={0.4}
          restrictPosition={false}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={(crop) => setCrop(crop)}
          onCropComplete={onCropComplete}
          onZoomChange={(zoom) => setZoom(zoom)}
          style={{
            containerStyle: {
              width: 512,
              height: 512,
              overflow: 'hidden',
              marginTop: 8,
              backgroundColor: '#000',
            },
            mediaStyle: {
              objectFit: 'cover',
              objectPosition: 'center top',
            },
            cropAreaStyle: {
              backgroundImage: 'url(/frame.png)',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              width: 512,
              height: 512,
            },
          }}
        />
      </div>

      <div style={{ marginTop: 50 }}>
        <label>upload image</label>
        <input
          type='file'
          accept='image/png image/jpeg image/jpg'
          alt='Image'
          placeholder='Upload Image'
        />
      </div>

      <div>
        <button
          onClick={async () => {
            console.log('start');
            // await cropImage();
            await overlayImage();
            console.log('imageReady');
          }}
        >
          DownloadImage
        </button>
      </div>
      <div>
        <img
          src={imgSrc}
          alt='actual cropped image'
          style={{ height: 512, width: 512 }}
        />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
