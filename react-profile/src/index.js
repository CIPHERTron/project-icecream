import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ImagePicker } from 'react-file-picker';
import jimp from 'jimp';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import { triggerBase64Download } from 'react-base64-downloader';

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState(1 / 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const onCropComplete = (croppedArea, croppedAreaPixels) =>
    setCroppedAreaPixels(croppedAreaPixels);

  const overlayImage = async () => {
    try {
      const cropImage = await getCroppedImg(uploadImage, croppedAreaPixels);

      const image1 = await jimp.read('/frame.png');
      const frame = image1.resize(3840, 3840);

      const image2 = await jimp.read(cropImage);
      const profile = image2.resize(3072, 3072).greyscale();

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
      <img
        src={'/frame.png'}
        alt='adfhkjadhfk'
        style={{
          width: 512,
          height: 512,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <div style={{ height: 453, width: 453, position: 'relative' }}>
        <Cropper
          image={uploadImage}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={(crop) => setCrop(crop)}
          onCropComplete={onCropComplete}
          onZoomChange={(zoom) => setZoom(zoom)}
          style={{
            cropAreaStyle: {
              width: '100%',
              height: '100%',
            },
            containerStyle: {
              position: 'absolute',
              top: 43,
              left: 41,
            },
            mediaStyle: {
              width: '100%',
              height: '100%',
            },
          }}
        />
      </div>
      <div style={{ marginTop: 100 }}>
        <ImagePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{
            minWidth: 100,
            maxWidth: 3840,
            minHeight: 100,
            maxHeight: 3840,
          }}
          onChange={(base64) => setUploadImage(base64)}
          onError={(errMsg) => console.log(errMsg)}
        >
          <button>Click to upload image</button>
        </ImagePicker>
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
