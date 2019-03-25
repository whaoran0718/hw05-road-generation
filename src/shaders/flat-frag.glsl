#version 300 es
precision highp float;

uniform sampler2D u_Texture;
uniform int u_Mode;

in vec4 fs_Pos;
out vec4 out_Col;

vec3 mapColor(vec4 flag) {
  return flag.x > 0.5 ? vec3(241.0, 204.0, 177.0) / 255.0 : vec3(108.0, 197.0, 227.0) / 255.0;
}

vec3 densityColor(vec4 flag) {
  if (flag.y > 0.5) {
    return mix(vec3(181.0, 0.0, 35.0) / 255.0, vec3(1.0), (1.0 - flag.y) * 2.0);
  }
  else {
    return mix(vec3(59.0, 76.0, 192.0) / 255.0, vec3(1.0), flag.y * 2.0);
  }
}

void main() {
  vec2 uv = fs_Pos.xy + 0.5;
  vec4 flag = texture(u_Texture, uv);
  vec3 col;
  if (u_Mode == 0) {
    col = mapColor(flag);
  }
  else if (u_Mode == 1) {
    col = densityColor(flag);
  }
  else if (u_Mode == 2) {
    col = flag.x > 0.5 ? densityColor(flag) : vec3(0.2, 0.2, 0.2);
  }
  out_Col = vec4(col, 1.0);
}