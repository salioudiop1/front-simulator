import React from 'react';

const CallControls = () => {

  return (
    <div className="d-flex align-items-center justify-content-center mb-3 me-2 mt-2">
      <div className="btn-group mx-2" role="group">
        <button type="button" className="btn btn-info" data-testid="call-info">
          <i className="me-1">
            {/* Icône téléphone barré */}
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="phone-slash"
              className="svg-inline--fa fa-phone-slash"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              width="16"
              height="16"
            >
              <path
                fill="currentColor"
                d="M271.1 367.5L227.9 313.7c-8.688-10.78-23.69-14.51-36.47-8.974l-108.5 46.51c-13.91 6-21.49 21.19-18.11 35.79l23.25 100.8C91.32 502 103.8 512 118.5 512c107.4 0 206.1-37.46 284.2-99.65l-88.75-69.56C300.6 351.9 286.6 360.3 271.1 367.5zM630.8 469.1l-159.6-125.1c65.03-78.97 104.7-179.5 104.7-289.5c0-14.66-9.969-27.2-24.22-30.45L451 .8125c-14.69-3.406-29.73 4.213-35.82 18.12l-46.52 108.5c-5.438 12.78-1.771 27.67 8.979 36.45l53.82 44.08C419.2 232.1 403.9 256.2 386.2 277.4L38.81 5.111C34.41 1.673 29.19 0 24.03 0C16.91 0 9.84 3.158 5.121 9.189c-8.188 10.44-6.37 25.53 4.068 33.7l591.1 463.1c10.5 8.203 25.57 6.328 33.69-4.078C643.1 492.4 641.2 477.3 630.8 469.1z"
              ></path>
            </svg>
          </i>
          No caller
        </button>

        <button type="button" className="btn btn-outline-danger d-inline-flex" data-testid="hangup-button">
          {/* Icône rouge hang up */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0)">
              <circle cx="12" cy="12" r="12" fill="#DF0000" />
              <g clipPath="url(#clip1)">
                <path
                  d="M11.9998 9.42859C13.3498 9.42859 14.6409 9.69912 15.8731 10.2402C17.1052 10.7813 18.1606 11.5661 19.0391 12.5947C19.1249 12.7018 19.1704 12.8197 19.1757 12.9482C19.1811 13.0768 19.1356 13.1893 19.0391 13.2857L17.5284 14.7964C17.4427 14.8822 17.3195 14.9304 17.1588 14.9411C16.9981 14.9518 16.8695 14.9197 16.7731 14.8447L14.9409 13.4786C14.8766 13.425 14.8284 13.3661 14.7963 13.3018C14.7641 13.2375 14.7481 13.1679 14.7481 13.0929V10.8589C14.2981 10.6875 13.84 10.567 13.374 10.4973C12.9079 10.4277 12.4498 10.3929 11.9998 10.3929C11.5498 10.3929 11.0918 10.4277 10.6257 10.4973C10.1597 10.567 9.70163 10.6875 9.25163 10.8589V13.0929C9.25163 13.1679 9.23556 13.2375 9.20342 13.3018C9.17128 13.3661 9.12306 13.425 9.05878 13.4786L7.22663 14.8447C7.09806 14.9411 6.96681 14.9839 6.83288 14.9732C6.69896 14.9625 6.57842 14.9036 6.47128 14.7964L4.96056 13.2857C4.86413 13.1893 4.8186 13.0768 4.82396 12.9482C4.82931 12.8197 4.87485 12.7018 4.96056 12.5947C5.83913 11.5661 6.89449 10.7813 8.12663 10.2402C9.35878 9.69912 10.6498 9.42859 11.9998 9.42859Z"
                  fill="white"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="24" height="24" fill="white" />
              </clipPath>
              <clipPath id="clip1">
                <rect width="15.4286" height="15.4286" fill="white" transform="translate(4.28577 4.28571)" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallControls;
