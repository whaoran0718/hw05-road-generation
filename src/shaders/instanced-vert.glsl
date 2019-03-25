#version 300 es

uniform mat4 u_ViewProj;
uniform mat4 u_Model;

in vec4 vs_Pos;
in vec4 vs_Col;
in vec4 vs_Translate;

out vec4 fs_Col;

float highwayWidth = 0.01;
float streetWidth = 0.005;

void main()
{
    fs_Col = vs_Col;
    vec2 start = vec2(vs_Translate.xy);
    vec2 end = vec2(vs_Translate.zw);
    vec2 segment = end - start;
    vec2 translate = (end + start) * 0.5;
    float len = length(segment);
    float c = segment.x / len;
    float s = segment.y / len;

    float width = vs_Col.w < 0.5 ? streetWidth : highwayWidth;
    mat3 transform = mat3(len * c, len * s, 0.0,
                          -width * s, width * c, 0.0,
                          translate.x, translate.y, 1.0);
    vec3 pos = transform * vec3(vs_Pos.xy, 1.0);
    gl_Position = u_ViewProj * vec4(pos.xy, 0.0, 1.0);
}
