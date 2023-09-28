import { useEffect, useRef } from "react";

export const Vid = ({stream}) => {
    const videoRef = useRef();
    useEffect(() => {
        if (videoRef && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
      }, [videoRef,stream])
    
      return (
        <div>
          <div>
            <video ref={videoRef} autoPlay={true}  />
          </div>
        </div>
      )
}