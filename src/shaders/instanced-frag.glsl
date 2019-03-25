#version 300 es
precision highp float;

in vec4 fs_Col;
out vec4 out_Col;

void main()
{
    //vec3 col = fs_Col.w > 0.5 ? vec3(255.0, 235.0, 161.0) / 255.0 : vec3(1.0);
    vec3 col = fs_Col.w > 0.5 ? vec3(245.0, 238.0, 161.0) / 255.0 : vec3(1.0);
    out_Col = vec4(col, 1.0);
}
