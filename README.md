# px_svg

Simple SVG path import for Jitter (Max 7).
The JavaScript code assumes exported SVG files from Autodesk's Graphic application (previously iDraw), and only imports the first path element in the file. Vectors are parsed and converted to points for use in OpenGL projects. This is especially useful for setting base-shapes for generative and sound-responsive animations like those created with the Jit.mo package (in the Max 7 Package Manager).
