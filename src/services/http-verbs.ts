export type HttpVerb = '*' | 'HEAD' | 'OPTIONS' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'TRACE'

const httpVerbs = [
  '*',
  'HEAD',
  'OPTIONS',
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'TRACE'
];

export const toHttpVerb = (candidate: string): HttpVerb => {
  if (!httpVerbs.includes(candidate.toUpperCase())) {
    throw new Error(`not a recognized HTTP verb: '${candidate}'`)
  }

  return candidate.toUpperCase() as HttpVerb;
}

// "safe" defined as per RFC2616, section 9
export const isSafe = (httpVerb: HttpVerb): boolean => {
  return httpVerb === 'GET' || httpVerb === 'HEAD';
}

