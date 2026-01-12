/**
 * @jest-environment jsdom
 */

import { SanitizationService } from "../../src/utils/sanitize";

describe("SanitizationService", () => {
  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const dangerous = '<div>Content<script>alert("xss")</script></div>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Content");
    });

    it("should remove iframe tags", () => {
      const dangerous = '<div><iframe src="evil.com"></iframe>Content</div>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<iframe");
      expect(result).toContain("Content");
    });

    it("should remove object tags", () => {
      const dangerous = '<div><object data="evil.swf"></object>Content</div>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<object");
    });

    it("should remove embed tags", () => {
      const dangerous = '<div><embed src="evil.swf">Content</div>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<embed");
    });

    it("should remove event handlers", () => {
      const dangerous = '<div onclick="alert()">Click</div>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("onclick");
    });

    it("should remove javascript: protocols", () => {
      const dangerous = '<a href="javascript:alert()">Link</a>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("javascript:");
    });

    it("should remove vbscript: protocols", () => {
      const dangerous = '<a href="vbscript:msgbox()">Link</a>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("vbscript:");
    });

    it("should remove data:text/html", () => {
      const dangerous =
        '<a href="data:text/html,<script>alert()</script>">Link</a>';
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("data:text/html");
    });

    it("should preserve safe HTML", () => {
      const safe = "<div><p>Paragraph</p><strong>Bold</strong></div>";
      const result = SanitizationService.sanitizeHtml(safe);
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
    });

    it("should handle multiple dangerous patterns", () => {
      const dangerous = `
        <script>alert(1)</script>
        <iframe src="evil"></iframe>
        <div onclick="alert(2)">Click</div>
      `;
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("<iframe");
      expect(result).not.toContain("onclick");
    });

    it("should handle nested dangerous content", () => {
      const dangerous = "<div><div><script>alert()</script></div></div>";
      const result = SanitizationService.sanitizeHtml(dangerous);
      expect(result).not.toContain("<script>");
    });

    it("should throw error for null input", () => {
      expect(() => {
        SanitizationService.sanitizeHtml(null as any);
      }).toThrow(/required/i);
    });

    it("should throw error for undefined input", () => {
      expect(() => {
        SanitizationService.sanitizeHtml(undefined as any);
      }).toThrow(/required/i);
    });

    it("should throw error for non-string input", () => {
      expect(() => {
        SanitizationService.sanitizeHtml(123 as any);
      }).toThrow(/must be a string/i);
    });
  });

  describe("encodeHtmlEntities", () => {
    it("should encode ampersands", () => {
      const result = SanitizationService.encodeHtmlEntities("Tom & Jerry");
      expect(result).toBe("Tom &amp; Jerry");
    });

    it("should encode less than", () => {
      const result = SanitizationService.encodeHtmlEntities("5 < 10");
      expect(result).toBe("5 &lt; 10");
    });

    it("should encode greater than", () => {
      const result = SanitizationService.encodeHtmlEntities("10 > 5");
      expect(result).toBe("10 &gt; 5");
    });

    it("should encode double quotes", () => {
      const result = SanitizationService.encodeHtmlEntities('Say "Hello"');
      expect(result).toBe("Say &quot;Hello&quot;");
    });

    it("should encode single quotes", () => {
      const result = SanitizationService.encodeHtmlEntities("It's working");
      expect(result).toBe("It&#039;s working");
    });

    it("should encode multiple entities", () => {
      const result = SanitizationService.encodeHtmlEntities(
        '<div class="test">A & B</div>'
      );
      expect(result).toBe(
        "&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;"
      );
    });

    it("should handle empty string", () => {
      const result = SanitizationService.encodeHtmlEntities("");
      expect(result).toBe("");
    });

    it("should preserve normal text", () => {
      const result = SanitizationService.encodeHtmlEntities("Normal text");
      expect(result).toBe("Normal text");
    });
  });

  describe("stripHtmlTags", () => {
    it("should remove all HTML tags", () => {
      const html = "<div><p>Hello</p><strong>World</strong></div>";
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).toBe("HelloWorld");
    });

    it("should preserve text content", () => {
      const html = "<div>Important content</div>";
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).toBe("Important content");
    });

    it("should handle self-closing tags", () => {
      const html = 'Line 1<br/>Line 2<img src="test.jpg"/>Text';
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).not.toContain("<br");
      expect(result).not.toContain("<img");
    });

    it("should handle nested tags", () => {
      const html = "<div><span><strong>Nested</strong></span></div>";
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).toBe("Nested");
    });

    it("should handle tags with attributes", () => {
      const html = '<div class="test" id="main">Content</div>';
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).toBe("Content");
    });

    it("should handle malformed tags", () => {
      const html = "<div>Content<div>More";
      const result = SanitizationService.stripHtmlTags(html);
      expect(result).toContain("Content");
      expect(result).toContain("More");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow http URLs", () => {
      const url = "http://example.com";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should allow https URLs", () => {
      const url = "https://example.com";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should block javascript: URLs", () => {
      const url = "javascript:alert()";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe("about:blank");
    });

    it("should block data: URLs", () => {
      const url = "data:text/html,<script>alert()</script>";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe("about:blank");
    });

    it("should block vbscript: URLs", () => {
      const url = "vbscript:msgbox()";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe("about:blank");
    });

    it("should allow relative URLs", () => {
      const url = "/path/to/page";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should allow mailto: URLs", () => {
      const url = "mailto:test@example.com";
      const result = SanitizationService.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it("should handle empty URLs", () => {
      const result = SanitizationService.sanitizeUrl("");
      expect(result).toBe("");
    });
  });

  describe("sanitizeCodeBlock", () => {
    it("should preserve code content", () => {
      const code = "function test() { return true; }";
      const result = SanitizationService.sanitizeCodeBlock(code);
      expect(result).toContain("function");
      expect(result).toContain("return");
    });

    it("should escape HTML in code", () => {
      const code = "<div>HTML in code</div>";
      const result = SanitizationService.sanitizeCodeBlock(code);
      expect(result).toContain("&lt;div&gt;");
    });

    it("should preserve special characters", () => {
      const code = "if (a && b) { return a > b; }";
      const result = SanitizationService.sanitizeCodeBlock(code);
      expect(result).toContain("&amp;&amp;");
      expect(result).toContain("&gt;");
    });

    it("should handle multiline code", () => {
      const code = `function test() {
  const a = 1;
  return a;
}`;
      const result = SanitizationService.sanitizeCodeBlock(code);
      expect(result).toContain("function");
      expect(result).toContain("const");
    });
  });

  describe("containsDangerousContent", () => {
    it("should detect script tags", () => {
      expect(
        SanitizationService.containsDangerousContent("<script>alert()</script>")
      ).toBe(true);
    });

    it("should detect iframe tags", () => {
      expect(
        SanitizationService.containsDangerousContent(
          '<iframe src="evil"></iframe>'
        )
      ).toBe(true);
    });

    it("should detect event handlers", () => {
      expect(
        SanitizationService.containsDangerousContent('<div onclick="alert()">')
      ).toBe(true);
    });

    it("should detect javascript: protocols", () => {
      expect(
        SanitizationService.containsDangerousContent("javascript:alert()")
      ).toBe(true);
    });

    it("should return false for safe content", () => {
      expect(
        SanitizationService.containsDangerousContent("<div>Safe content</div>")
      ).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very long strings", () => {
      const long = "<div>" + "x".repeat(10000) + "</div>";
      const result = SanitizationService.sanitizeHtml(long);
      expect(result).toBeDefined();
    });

    it("should handle unicode characters", () => {
      const unicode = "<div>你好世界 🌍 مرحبا</div>";
      const result = SanitizationService.sanitizeHtml(unicode);
      expect(result).toContain("你好世界");
    });

    it("should handle case variations in tags", () => {
      const mixed = "<SCRIPT>alert()</SCRIPT><ScRiPt>alert()</ScRiPt>";
      const result = SanitizationService.sanitizeHtml(mixed);
      expect(result).not.toContain("SCRIPT");
      expect(result).not.toContain("ScRiPt");
    });

    it("should handle comments", () => {
      const withComments = "<!-- comment --><div>Content</div>";
      const result = SanitizationService.sanitizeHtml(withComments);
      expect(result).toContain("Content");
    });

    it("should handle CDATA sections", () => {
      const withCdata = "<div><![CDATA[data]]>Content</div>";
      const result = SanitizationService.sanitizeHtml(withCdata);
      expect(result).toContain("Content");
    });
  });

  describe("XSS attack vectors", () => {
    it("should block img onerror XSS", () => {
      const xss = '<img src=x onerror="alert(1)">';
      const result = SanitizationService.sanitizeHtml(xss);
      expect(result).not.toContain("onerror");
    });

    it("should block svg XSS", () => {
      const xss = '<svg onload="alert(1)">';
      const result = SanitizationService.sanitizeHtml(xss);
      expect(result).not.toContain("onload");
    });

    it("should block form action XSS", () => {
      const xss = '<form action="javascript:alert(1)">';
      const result = SanitizationService.sanitizeHtml(xss);
      expect(result).not.toContain("javascript:");
    });

    it("should block meta refresh XSS", () => {
      const xss =
        '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">';
      const result = SanitizationService.sanitizeHtml(xss);
      expect(result).not.toContain("javascript:");
    });
  });
});
