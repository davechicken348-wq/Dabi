export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const roomId = url.pathname.split('/').pop();

  // Only bots / crawlers need OG tags — real browsers get the SPA as normal.
  // WhatsApp, Telegram, Twitter, Slack, iMessage all send a recognisable UA.
  const ua = req.headers.get('user-agent') ?? '';
  const isCrawler = /whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|iframely|preview/i.test(ua);

  if (!isCrawler || !roomId) {
    return; // let Vercel's SPA rewrite handle it normally
  }

  const env = globalThis as unknown as Record<string, string>;
  const apiUrl = env.VITE_API_URL ?? env.API_URL ?? '';

  let ogTitle = 'Dabi — Find Your Room';
  let ogDescription = 'Verified student accommodation near your campus.';
  let ogImage = 'https://dabi.vercel.app/og-default.jpg';
  let ogUrl = url.toString();

  try {
    const res = await fetch(`${apiUrl}/api/hostels`);
    if (res.ok) {
      const hostels: any[] = await res.json();
      for (const hostel of hostels) {
        const room = (hostel.roomOfferings ?? []).find((r: any) => r.id === roomId)
          ?? (hostel.id === roomId || `${hostel.id}-room` === roomId ? hostel : null);
        if (room) {
          const price = room.price ?? hostel.pricePerYear ?? 0;
          const period = room.pricingPeriod === 'Semester' ? 'semester' : 'academic year';
          const roomType = room.roomType ?? hostel.roomType ?? 'Room';
          const photos: string[] = hostel.photos?.length ? hostel.photos : hostel.image ? [hostel.image] : [];

          ogTitle = `${roomType} at ${hostel.name} | Dabi`;
          ogDescription = `GH₵${price.toLocaleString()} / ${period} · ${hostel.location}. Verified student accommodation on Dabi.`;
          if (photos[0]) ogImage = photos[0];
          break;
        }
      }
    }
  } catch {
    // fall through to defaults
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDescription}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Dabi" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDescription}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDescription}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0;url=${ogUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${ogUrl}">${ogTitle}</a>…</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=60',
    },
  });
}
