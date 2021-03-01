import * as jsonWebToken from "jsonwebtoken";
import {getCertificateChain} from "../../src/services/azure";
import jwtJson from '../resources/jwt.json';
import configuration from "../../src/services/configuration";
import {checkSignature} from "../../src/services/signature-check";
import {safeLoad} from "js-yaml";
import * as fs from "fs";

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementationOnce((token, _certificate, _options) => token)
}));

describe('verify()', () => {
  beforeAll(() => {
    (configuration as jest.Mock) = jest.fn().mockResolvedValue(safeLoad(fs.readFileSync('tests/resources/fakeConfig.yml', 'utf8')));
    (getCertificateChain as jest.Mock) = jest.fn().mockReturnValue('fake certificate');
  });

  it('should throw an error if decode fails', async () => {
    await checkSignature(jwtJson);

    expect(jsonWebToken.verify).toBeCalledWith(
      jwtJson,
      'fake certificate',
      {
        audience: jwtJson.payload.aud,
        issuer: 'http://happyfuntimes.com/abc123/',
        algorithms: ["RS256"]
      }
    );
  });
});
