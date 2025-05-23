const professionalExperience = [
  {
    dates: "2018-now",
    id: "meta",
    subject: `<em>Research Scientist</em>, <a href="http://meta.com">Meta</a>, Menlo Park, CA.`,
    description:
      "Since 2022, I've been focused on Generative AI for image and video. I currently lead data for generative video, and Monetization GenAI media training data prior to that.  I worked on a number of applied AI/computer vision projects, including detection for product recognition and synthetic training data.",
  },
  {
    dates: "2017",
    id: "figma",
    subject: `<em>Consulting Data Scientist</em>, <a href="http://figma.com">Figma</a>, San Francisco, CA.`,
    description:
      "Establishing the analytics foundation. Logging, infrastructure, and analysis assisting both growth and product decisions.",
  },
  {
    dates: "2014-2016",
    id: "sprig",
    subject: `<em>Data Scientist</em>, <a href="http://sprig.com">Sprig</a>, San Francisco, CA.`,
    description:
      "Involved in all data aspects of a complex logistics and culinary business. Designed and implemented real-time system for accepting orders, intelligently throttling order-rate based on system load to maximize delivery efficiency while preserving SLA. Designed demand forecasting tools for planning and procurement of future menus. Provided deep analysis to product and business teams.",
  },
  {
    dates: "2013-2014",
    id: "adobe",
    subject: `<em>Computer Scientist</em>, <a href="http://adobe.com">Adobe</a>, San Francisco, CA.`,
    description:
      "Designed and implemented mobile photography apps, covering GPU-processing frameworks, implementing image processing algorithms, and desiging interfaces to expose those algorithms. Developing data pipelines for creative products. Conducting research identifying and classifying visual style of images, as well as recommending content-specific edits.",
  },
  {
    dates: "2011-2012",
    id: "pocket-pixels",
    subject: `<em>Researcher / Developer</em>, <a href="http://pocketpixels.com">Pocket Pixels</a>, Vancouver, BC.`,
    description:
      "Top-selling selective desaturation photography for iPhone and iPad. Completely rebuilt the app's graphics framework, included interactive image adjustments and faster performance. After release, the app rose to #6 in the US store.",
  },
  {
    dates: "2007-2009",
    id: "dolby",
    subject: `<em>Research Engineer</em>, <a href="http://dolby.com">Dolby</a>, Vancouver, BC.`,
    description:
      "Supported the development of Dolby technology licensed to manufacturers, including the SIM2 Grand Cinema SOLAR. Developed calibration methods for accurate display of content on HDR displays, and environment sensing setups for adjusting display color to the viewing environment. Reduced visible artifacts from LED variation by 90%.",
  },
  {
    dates: "2004-2007",
    id: "brightside",
    subject: `<em>Principal Software Developer / Researcher</em>, <a href="https://www.dolby.com/us/en/brands/dolby-vision.html">BrightSide Technologies</a>, Vancouver, BC.`,
    description:
      "Responsible for the complete design, development, and implementation of a the video processing pipeline for LED-backlight display prototype, the BrightSide DR37-P. Developed the GPU-accelerated software used for all demos, securing 2 years worth of investment capital. Created third-party API for display hardware. Expanded IP portfolio.",
  },
];

const education = [
  {
    dates: "2012",
    id: "phd",
    subject: "PhD in Computer Science, University of British Columbia",
    description: `<a href="/scale-dependent-perception">Manipulating Scale-Dependent Perception of Images</a>, advised by Wolfgang Heidrich.`,
  },
  {
    dates: "2006",
    id: "msc",
    subject: "MSc in Computer Science, University of British Columbia",
    description: `<a href="/photometric-processing">Photometric Image Processing for High Dynamic Range Displays</a>, advised by Wolfgang Heidrich.`,
  },
  {
    dates: "2003",
    id: "bsc",
    subject: "BSc in Computer Science, Carnegie Mellon University",
    description: `<a href="/attachments/research/papers/UgradThesis.pdf">Implementing Performance Numerical Libraries on Graphics Hardware</a>, advised by Doug James.`,
  },
];

const journalArticles = [
  {
    date: "2014",
    content: `<a href="http://sergeykarayev.com/recognizing-image-style">Recognizing Image Style</a>, S. Karayev, M. Trentacoste, H. Han, A. Agarwala, T. Darrell, A. Hertzmann, H. Winnemoeller. British Machine Vision Conf.`,
  },
  {
    date: "2012",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2012/Countershading/">Scale-Dependent Perception of Countershading: Enhancement or Artifact?</a>, M. Trentacoste, R. Mantiuk, W. Heidrich, F. Dufrot. Eurographics`,
  },
  {
    date: "2011",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2011/GlareEncodingHDR/">Glare Encoding of High Dynamic Range Images</a>, M. Rouf, R. Mantiuk, W. Heidrich, M. Trentacoste, C. Lau. CVPR`,
  },
  {
    date: "2011",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2011/BlurAwareDownsize/">Blur-Aware Image Downsizing</a>, M. Trentacoste, R. Mantiuk, W. Heidrich. Eurographics`,
  },
  {
    date: "2010",
    content: `<a href="/attachments/research/papers/ElectronicImaging.2010-Defocus.pdf">Defocus Techniques for Camera Dynamic Range Expansion</a>, M. Trentacoste, C. Lau, M. Rouf, R. Mantiuk, W. Heidrich. Proceedings of Human Vision and Electronic Imaging XXI`,
  },
  {
    date: "2007",
    content: `<a href="http://dx.doi.org/10.1016/j.jvcir.2007.06.006">Photometric Image Processing for High Dynamic Range Displays</a>, M. Trentacoste, W. Heidrich, L. Whitehead, H. Seetzen, G. Ward. Journal of Visual Communication and Image Representation, Special Issue on High Dynamic Range Imaging`,
  },
  {
    date: "2007",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2007/Rempel_Ldr2Hdr">Ldr2Hdr: On-the-fly Reverse Tone Mapping of Legacy Video and Photographs</a>, A. G. Rempel, M. Trentacoste, H. Seetzen, D. Young, W. Heidrich, L. Whitehead, G. Ward. Transactions on Graphics, SIGGRAPH`,
  },
  {
    date: "2005",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2005/ActiveLighting">Real Illumination from Virtual Environments</a>, A. Ghosh, M. Trentacoste, H. Seetzen, and W. Heidrich. Eurographics Symposium on Rendering`,
  },
  {
    date: "2005",
    content: `<a href="/attachments/research/papers/VolumeGraphics.2005-HDR_Vol_Ren.pdf">Volume Rendering for High Dynamic Range Displays</a>, A. Ghosh, M. Trentacoste and W. Heidrich. International Workshop on Volume Graphics`,
  },
  {
    date: "2004",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2004/Seetzen_2004_HDR">High Dynamic Range Display Systems</a>, H. Seetzen, W. Heidrich, W. Stuerzlinger, G. Ward, L. Whitehead, M. Trentacoste, A. Ghosh, A. Vorozcovs. Transactions on Graphics, SIGGRAPH`,
  },
];

const patents = [
  {
    date: "2009",
    content: `<a href="https://www.google.com/patents/US20100277515">Mitigation of LCD Flare</a>, G. Ward, J. Harrison, H. Seetzen, M. Trentacoste, US 2010/0277515 A1`,
  },
  {
    date: "2007",
    content: `<a href="https://www.google.com/patents/US20100091045">Multiple Modulator Displays and Related Methods</a>, W. Heidrich, M. Trentacoste, G. Ward, H. Seetzen, US 2010/0091045 A1`,
  },
];

const talksAndMisc = [
  {
    date: "2024",
    content: `Meta GenAI <a href="https://www.facebook.com/business/news/Introducing-Enhanced-Gen-AI-Features-and-Other-Tools-to-Help-Build-Your-Business">image</a> and <a href="https://www.facebook.com/business/news/Unlock-Video-Performance-with-GenAI-and-Creator-Marketing">video</a> tools for advertisers`,
  },
  {
    date: "2015",
    content: `<a href="http://www.adobe.com/products/fix.html">Adobe Photoshop Fix</a>`,
  },
  {
    date: "2013",
    content: `<a href="https://github.com/matttrent/pydata-nyc-2013">Image Features in Python</a> talk (<a href="https://speakerdeck.com/matttrent/image-features-in-python">slides</a>) (<a href="https://vimeo.com/79536175">video</a>)`,
  },
  {
    date: "2012",
    content: `<a href="http://www.pocketpixels.com/ColorSplash.html">Color Splash</a>`,
  },
  {
    date: "2011",
    content: `<a href="/scale-dependent-perception">Manipulating Scale-Dependent Perception of Images</a> invited talk. Disney Research, Massachusetts Institute of Technology, NVIDIA`,
  },
  {
    date: "2011",
    content: `<a href="http://www.cs.ubc.ca/labs/imager/tr/2011/BlurAwareDownsize/">Blur-Aware Image Downsizing</a> invited talk. Bangor University, Adobe`,
  },
  {
    date: "2009",
    content: `<a href="http://www.dolby.com/us/en/brands/dolby-vision.html">Dolby Vision display</a>`,
  },
  {
    date: "2005",
    content: `<a href="http://isg.cs.tcd.ie/eg2005/T7.html">High Dynamic Range Techniques in Graphics: from Acquisition to Display</a>. M. Goesele, W. Heidrich, B. Hoefflinger, G. Krawczyk, K. Myszkowski, M. Trentacoste, Eurographics`,
  },
];

export { professionalExperience, education, journalArticles, patents, talksAndMisc };
