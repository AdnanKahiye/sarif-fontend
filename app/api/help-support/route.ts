import { NextResponse } from "next/server";

const BOT_TOKEN = "8947121083:AAEeQ15aXGDqbRggVCODI6Zy1gpUcUmjS9Y";
const CHAT_ID = "6249304552";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      businessName,
      branch,
      username,
      phoneNumber,
      category,
      problemTitle,
      problemDescription,
      screenshotCount,
      systemInfo,
    } = body;

    const message = `
🆘 <b>NEW SUPPORT REQUEST</b>

🏢 <b>Business Name:</b> ${businessName}

🏬 <b>Branch:</b> ${branch}

👤 <b>Username:</b> ${username}

📞 <b>Phone Number:</b> ${phoneNumber}

📂 <b>Category:</b> ${category}

📝 <b>Problem Title:</b>
${problemTitle}

📄 <b>Problem Description:</b>
${problemDescription}

📷 <b>Screenshot Count:</b> ${screenshotCount}

━━━━━━━━━━━━━━━━━━━━

💻 <b>Device:</b> ${systemInfo.deviceType}

🌐 <b>Browser:</b> ${systemInfo.browserName}

🖥 <b>Operating System:</b> ${systemInfo.operatingSystem}

📺 <b>Resolution:</b> ${systemInfo.screenResolution}

🌍 <b>Language:</b> ${systemInfo.language}

🕓 <b>Timezone:</b> ${systemInfo.timezone}

📅 <b>Date:</b> ${systemInfo.currentDate}

⏰ <b>Time:</b> ${systemInfo.currentTime}
`;

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.description,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}