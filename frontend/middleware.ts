export const config = {
  matcher: '/findroom/rooms/:roomId*',
};

export default function middleware(req: Request) {
  const ua = req.headers.get('user-agent') ?? '';
  const isCrawler = /whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|iframely|preview/i.test(ua);

  if (!isCrawler) return;

  const url = new URL(req.url);
  const roomId = url.pathname.split('/').pop();
  url.pathname = '/api/room-og';
  url.searchParams.set('roomId', roomId ?? '');
  return Response.redirect(url, 302);
}
