package edu.umdearborn.astronomyapp.config.sanitiser;

import java.io.IOException;
import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;
import org.owasp.html.AttributePolicy;
import org.owasp.html.ElementPolicy;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.NonTypedScalarSerializerBase;

public class SanatizedStringSeralizer extends NonTypedScalarSerializerBase<String> {

  private static final long          serialVersionUID = -4084762863288732797L;
  public static final PolicyFactory LINKS = new HtmlPolicyBuilder()
	      .allowStandardUrlProtocols()
	      .allowElements(new ElementPolicy() {
				@Override
				public String apply(String elementName, List<String> attrs) {
					attrs.add("target");
					attrs.add("_blank");
					attrs.add("rel");
					attrs.add("noopener noreferrer nofollow");
					return "a";
				}
		      }, "a").allowAttributes("href").onElements("a")
	      .toFactory();
  
  private static final AttributePolicy INTEGER = new AttributePolicy() {
	    public String apply(
	        String elementName, String attributeName, String value) {
	      int n = value.length();
	      if (n == 0) { return null; }
	      for (int i = 0; i < n; ++i) {
	        char ch = value.charAt(i);
	        if (ch == '.') {
	          if (i == 0) { return null; }
	          return value.substring(0, i);  // truncate to integer.
	        } else if (!('0' <= ch && ch <= '9')) {
	          return null;
	        }
	      }
	      return value;
	    }
	  };
  
  public static final PolicyFactory IMAGES = new HtmlPolicyBuilder()
	      .allowUrlProtocols("http", "https")
	      .allowElements(new ElementPolicy() {
				@Override
				public String apply(String elementName, List<String> attrs) {
					if(attrs.contains("ta-insert-video") && !attrs.contains("style"))
					{
						attrs.add("style");
						attrs.add("height: 360px;width: 480px;");
					}
					return "img";
				}
		      }, "img")
	      .allowAttributes("alt", "src", "class", "ta-insert-video", "contenteditable", "allowfullscreen").onElements("img")
	      .allowAttributes("border", "height", "width", "frameborder").matching(INTEGER).onElements("img")
	      .toFactory();

  private static final PolicyFactory POLICY_FACTORY = Sanitizers.BLOCKS.and(Sanitizers.FORMATTING)
      .and(IMAGES).and(LINKS).and(Sanitizers.STYLES);
  
  public SanatizedStringSeralizer() {
    super(String.class);
  }

  @Override
  public void serialize(String value, JsonGenerator gen, SerializerProvider provider)
      throws IOException {

    gen.writeString(StringEscapeUtils.unescapeHtml3(POLICY_FACTORY.sanitize(value)));
  }
}
