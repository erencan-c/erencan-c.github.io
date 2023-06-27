# WebGL Fragment Shader Ray Tracer

After extracting the zip file to any place, you can run it with any simple HTTP server. Python has a built-in one, you can just run the command

```
$ python -m http.server 8080
```

when you are at the directory where you extracted the zip. The command will create a server at [the localhost](localhost:8080/). You can also specify another port instead of 8080. When you do this, do not forget to change the port after the colon in the localhost link. Also, you can always access it [here in my website](https://erenjanje.github.io/apps/webglrt).

You shouldn't need any other library. A modern and up-to-date browser may be needed but any browser supporting WebGL2 should be enough. You may also run it on a smartphone, but the performance will probably be pretty bad, and the controls would be unusable without an external keyboard. I tested the page on Firefox 114 and Vivaldi 6.1.3035.111 (which is based on Chromium but I don't know the exact version). As I said, any modern version of any modern browser should be OK.

The page starts at stopped (to prevent any PC heating etc. when you forget to close the page after opening it, at least I experienced this). You can press the g button to start running. The controls can be seen on the top of the canvas/image. You can always stop by pressing g again, it toggles. Note that the sliders disappear when another scene is loaded. Also, you need to be running in order to observe any change, including changing the scene.

To use your own scenes, you can use the same format as CENG477 HW1. Refract support is added with `Refractance` and `RefractanceRatio` tags inside the `Material` tags. `Refractance` tag has a single number inside which is the refractive index of the material, used to calculate the angle of the refracted ray. `RefractanceRatio` is the color coefficient of the refracted ray, working similar to the `MirrorReflectance` tag, and takes three numbers seperated by whitespace.

Here is an example material with reflectance and refractance.

```xml
<Material id="5" type="mirror">
    <AmbientReflectance>1 1 1</AmbientReflectance>
    <DiffuseReflectance>0 0 0</DiffuseReflectance>
    <SpecularReflectance>0 0 0</SpecularReflectance>
    <MirrorReflectance>0.9 0.9 0.9</MirrorReflectance>
    <Refractance>1.0</Refractance>
    <RefractanceRatio>0.6 0.6 0.6</RefractanceRatio>
    <PhongExponent>1</PhongExponent>
</Material>
```

Note that the `id` and `type` attributes do not work anymore, they are simply ignored. The id is the declaration order, starting from 1 so that the existing scenes can be used. `Mesh` and `Sphere` `id`s are also not used.

To explore the code, you can use the JavaScript files, but TypeScript files are better since JS files are created by the TS compiler, so there may be some parts where human readibility was not a concern.
