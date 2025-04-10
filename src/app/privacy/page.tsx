import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-4">Last Updated: April 9, 2025</p>
      
      {/* --- START: PRIVACY POLICY CONTENT --- */}
      <div className="prose dark:prose-invert max-w-none">

        <p className="mb-4">Welcome to AI Garden! This Privacy Policy explains how AI Garden (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and protects your information when you use our website and services (collectively, the &quot;Service&quot;).</p>
        <p className="mb-4">Please read this Privacy Policy carefully. By accessing or using our Service, you agree to the terms of this Privacy Policy. If you do not agree, please do not access or use the Service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">We collect information you provide directly to us and information collected automatically through your use of the Service.</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">(a) Information You Provide Directly:</h3>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and a securely hashed version of your password. We do not store your plain text password.</li>
          <li>
            <strong>Chat History (Optional):</strong> You have the <strong>choice</strong> whether to store your chat history (prompts and AI responses) within the Service.
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li><strong>If you opt-in to storage:</strong> Your chat history will be associated with your account to provide conversation memory and allow you to review past interactions. This data is stored while your account is active and you maintain the opt-in setting, or until you choose to delete it (if this feature is made available).</li>
              <li><strong>If you opt-out of storage:</strong> Your chat prompts and AI responses for that session will generally not be stored by AI Garden after the session ends, and conversational memory features relying on stored history will not be available.</li>
            </ul>
          </li>
          <li><strong>Communications:</strong> If you contact us directly (e.g., via email), we may collect your name, email address, and the contents of your message.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">(b) Information Collected Automatically:</h3>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Log and Usage Data:</strong> Like most websites, we may automatically collect log information, such as your IP address, browser type, operating system, pages visited, access times, and potentially other standard web log information when you use the Service. This helps us maintain and secure the Service.</li>
          <li><strong>Cookies:</strong> We use necessary cookies (like those managed by NextAuth) to manage your authentication session and keep you logged in. We currently do not use cookies for tracking or advertising.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect for various purposes, including:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>To provide, operate, maintain, and improve the Service.</li>
          <li>To create and manage your user account and authenticate you.</li>
          <li>To provide optional chat history and conversational memory features <strong>if you opt-in</strong>.</li>
          <li>To communicate with you, including responding to your inquiries and sending service-related notices.</li>
          <li>To monitor and analyze usage and trends to improve the user experience.</li>
          <li>To enhance the security of the Service, prevent fraud, and enforce our terms.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p className="mb-4 font-semibold">Important Note on Chat Data Usage:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>AI Garden Storage (If Opted-In):</strong> Stored chat history is primarily used to provide you with access to past conversations and enable memory features within the Service. While we implement access controls, AI Garden personnel may access this data only when strictly necessary for debugging, security, or support purposes, and we strive to keep this data confidential.</li>
          <li><strong>Third-Party AI Models:</strong> To provide the chat functionality, your prompts (whether you opt-in to storage with AI Garden or not) are sent to third-party AI model providers (e.g., OpenAI, Google, Anthropic). These providers have their own privacy policies governing how they handle the data they receive. We encourage you to review the privacy policies of the specific AI models you interact with via our Service. AI Garden is not responsible for the data practices of these third-party providers.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. How We Share Your Information</h2>
        <p className="mb-4">We do not sell your personal information. We may share information in the following circumstances:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>With Third-Party Service Providers:</strong> We share information with third-party vendors and service providers that perform services on our behalf, such as database hosting (MongoDB) and the AI model providers necessary to fulfill your chat requests. These providers only receive the information necessary to perform their designated functions.</li>
          <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law, subpoena, or other legal process, or if we have a good faith belief that disclosure is reasonably necessary to (i) investigate, prevent, or take action regarding suspected or actual illegal activities or to assist government enforcement agencies; (ii) enforce our agreements with you; (iii) investigate and defend ourselves against any third-party claims or allegations; (iv) protect the security or integrity of the Service; or (v) exercise or protect the rights, property, or personal safety of AI Garden, our users, or others.</li>
          <li><strong>With Your Consent:</strong> We may share information for other purposes with your explicit consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p className="mb-4">We implement reasonable security measures designed to protect your information from unauthorized access, disclosure, alteration, and destruction. This includes hashing passwords and using secure connections. However, no internet transmission or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for maintaining the security of your account credentials.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Data Retention</h2>
        <p className="mb-4">We retain your account information for as long as your account is active or as needed to provide you with the Service. We retain optional chat history (if you&apos;ve opted-in) as described in Section 1(a). We may retain certain information for longer periods as required by law or for legitimate business purposes like security and fraud prevention.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Your Choices and Rights</h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Account Information:</strong> You may review and update your account information through your account settings (if available) or by contacting us.</li>
          <li><strong>Chat History Storage:</strong> You can manage your preference for storing chat history within the Service settings (if this feature is implemented).</li>
          <li><strong>Access and Deletion:</strong> Depending on your location, you may have rights to access, correct, or delete your personal information. Please contact us to make such requests. We will respond to requests in accordance with applicable laws.</li>
          <li><strong>Cookies:</strong> You can usually instruct your browser to refuse cookies, but this may prevent you from using certain parts of our Service, particularly authentication.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. Children&apos;s Privacy</h2>
        <p className="mb-4">Our Service is not directed to individuals under the age of 13 (or a higher age threshold depending on the jurisdiction). We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Changes to This Privacy Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email (if we have your address), by posting a notice on the Service, or as otherwise required by law. Your continued use of the Service after any changes constitutes your acceptance of the new Privacy Policy.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contact Us</h2>
        <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at: colenielson6@gmail.com</p>

      </div>
      {/* --- END: PRIVACY POLICY CONTENT --- */}
    </div>
  );
} 