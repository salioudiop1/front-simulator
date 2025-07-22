import React from 'react';
import { useUserContext } from '../../utils/UserContext';

const UserInfo = () => {
  const { selectedUser: user } = useUserContext();

  if (!user) return null;

  return (
    <div className="d-flex justify-content-center position-relative mt-1">
      <div className="d-flex flex-column justify-content-center text-center">

        {/* Badges agent et/ou merchant */}
        {(user.merchant || user.agent) && (
          <div className="user-badges mb-2 d-flex justify-content-center gap-1">
            {user.merchant && (
              <span className="badge bg-purple text-white cursor-pointer" title="Ce client possède un compte marchand">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <title>This user also has a merchant account</title>
                  <path d="M96 0C107.5 0 117.4 8.19 119.6 19.51L121.1 32H541.8C562.1 32 578.3 52.25 572.6 72.66L518.6 264.7C514.7 278.5 502.1 288 487.8 288H170.7L179.9 336H488C501.3 336 512 346.7 512 360C512 373.3 501.3 384 488 384H159.1C148.5 384 138.6 375.8 136.4 364.5L76.14 48H24C10.75 48 0 37.25 0 24C0 10.75 10.75 0 24 0H96zM128 464C128 437.5 149.5 416 176 416C202.5 416 224 437.5 224 464C224 490.5 202.5 512 176 512C149.5 512 128 490.5 128 464zM512 464C512 490.5 490.5 512 464 512C437.5 512 416 490.5 416 464C416 437.5 437.5 416 464 416C490.5 416 512 437.5 512 464z" />
                </svg>
              </span>
            )}
            {user.agent && (
              <span className="badge bg-primary cursor-pointer" title="Ce client est agent">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <title>This user also has an agent account</title>
                  <path d="M96 0C107.5 0 117.4 8.19 119.6 19.51L121.1 32H541.8C562.1 32 578.3 52.25 572.6 72.66L518.6 264.7C514.7 278.5 502.1 288 487.8 288H170.7L179.9 336H488C501.3 336 512 346.7 512 360C512 373.3 501.3 384 488 384H159.1C148.5 384 138.6 375.8 136.4 364.5L76.14 48H24C10.75 48 0 37.25 0 24C0 10.75 10.75 0 24 0H96z" />
                </svg>
              </span>
            )}
          </div>
        )}

        <h4 id="name_header" className="mb-0">
          <span id="user_name" className="cursor-pointer">
            {user.kyc_name ? user.kyc_name : user.name}
          </span>
        </h4>
        {user.kyc_name && user.kyc_name !== user.name && (
          <small className="text-muted" style={{ fontSize: "17px" }}>
            {user.name}
          </small>
        )}

        {/* Numéro */}
        <h6 id="mobile_and_email" className="cursor-pointer">
          {user.phone}
        </h6>
      </div>
    </div>
  );
};

export default UserInfo;
