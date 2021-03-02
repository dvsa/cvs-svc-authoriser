import * as jsonWebToken from "jsonwebtoken";
import {getCertificateChain} from "../../../src/services/azure";
import jwtJson from '../../resources/jwt.json';
import {checkSignature} from "../../../src/services/signature-check";

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementationOnce((token, _certificate, _options) => token)
}));

describe('checkSignature()', () => {
  beforeAll(() => {
    (getCertificateChain as jest.Mock) = jest.fn().mockReturnValue('fake certificate');
  });

  it('should throw an error if decode fails', async () => {
    await checkSignature(jwtJson);

    expect(jsonWebToken.verify).toBeCalledWith(
      jwtJson,
      'fake certificate',
      {
        audience: jwtJson.payload.aud,
        issuer: 'https://login.microsoftonline.com/9122040d-6c67-4c5b-b112-36a304b66dad/v2.0',
        algorithms: [ "RS256" ]
      }
    );
  });
});
