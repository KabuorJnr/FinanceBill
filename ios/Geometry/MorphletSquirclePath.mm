//
//  MorphletSquirclePath.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSquirclePath.h"

static const NSInteger kCornerPointCount = 10;
static const CGFloat kContinuousCornerExtent = 1.52866483;

typedef struct {
  CGPoint points[kCornerPointCount];
} MorphletCorner;

static MorphletCorner MorphletSmoothedCorner(CGFloat radius, CGFloat smoothing, CGFloat budget) {
  CGFloat p = MIN((1 + smoothing) * radius, budget);
  smoothing = MAX(0, MIN(smoothing, budget / radius - 1));

  CGFloat arcMeasure = (M_PI / 2) * (1 - smoothing);
  CGFloat arcLength = sin(arcMeasure / 2) * radius * M_SQRT2;
  CGFloat alpha = ((M_PI / 2) - arcMeasure) / 2;
  CGFloat p3ToP4 = radius * tan(alpha / 2);
  CGFloat beta = (M_PI / 4) * smoothing;
  CGFloat c = p3ToP4 * cos(beta);
  CGFloat d = c * tan(beta);
  CGFloat b = (p - arcLength - c - d) / 3;
  CGFloat a = 2 * b;

  CGFloat sx = -p;
  CGFloat ax = sx + a + b + c;
  CGFloat ay = d;
  CGFloat bx = ax + arcLength;
  CGFloat by = ay + arcLength;
  CGFloat k = (4.0 / 3.0) * tan(arcMeasure / 4) * radius;
  CGFloat ta = alpha;
  CGFloat tb = (M_PI / 2) - alpha;

  return (MorphletCorner){{
    {sx, 0},
    {sx + a, 0},
    {sx + a + b, 0},
    {ax, ay},
    {ax + k * cos(ta), ay + k * sin(ta)},
    {bx - k * cos(tb), by - k * sin(tb)},
    {bx, by},
    {bx + d, by + c},
    {bx + d, by + b + c},
    {bx + d, by + a + b + c},
  }};
}

static MorphletCorner MorphletContinuousCorner(CGFloat radius, CGFloat budget) {
  CGFloat r = MIN(radius, budget / kContinuousCornerExtent);
  return (MorphletCorner){{
    {-kContinuousCornerExtent * r, 0},
    {-1.08849323 * r, 0},
    {-0.86840689 * r, 0},
    {-0.63149399 * r, 0.07491100 * r},
    {-0.37282392 * r, 0.16906013 * r},
    {-0.16906013 * r, 0.37282392 * r},
    {-0.07491100 * r, 0.63149399 * r},
    {0, 0.86840689 * r},
    {0, 1.08849323 * r},
    {0, kContinuousCornerExtent * r},
  }};
}

static void MorphletAddCorner(UIBezierPath *path,
                              MorphletCorner shape,
                              CGPoint corner,
                              CGVector e1,
                              CGVector e2,
                              BOOL moveToStart) {
  CGPoint points[kCornerPointCount];
  for (NSInteger index = 0; index < kCornerPointCount; index++) {
    CGPoint local = shape.points[index];
    points[index] =
      CGPointMake(corner.x + e1.dx * local.x + e2.dx * local.y, corner.y + e1.dy * local.x + e2.dy * local.y);
  }

  if (moveToStart) {
    [path moveToPoint:points[0]];
  } else {
    [path addLineToPoint:points[0]];
  }
  [path addCurveToPoint:points[3] controlPoint1:points[1] controlPoint2:points[2]];
  [path addCurveToPoint:points[6] controlPoint1:points[4] controlPoint2:points[5]];
  [path addCurveToPoint:points[9] controlPoint1:points[7] controlPoint2:points[8]];
}

UIBezierPath *MorphletSquirclePath(CGSize size, CGFloat cornerRadius, CGFloat smoothing, CGFloat displayCurve) {
  CGFloat w = MAX(size.width, 0.01);
  CGFloat h = MAX(size.height, 0.01);
  CGFloat budget = MIN(w, h) / 2;
  CGFloat radius = MAX(MIN(cornerRadius, budget), 0.001);
  CGFloat blend = MAX(0, MIN(1, displayCurve));

  MorphletCorner smoothed = MorphletSmoothedCorner(radius, smoothing, budget);
  MorphletCorner continuous = MorphletContinuousCorner(radius, budget);
  MorphletCorner shape;
  for (NSInteger index = 0; index < kCornerPointCount; index++) {
    shape.points[index] = CGPointMake(smoothed.points[index].x + (continuous.points[index].x - smoothed.points[index].x) * blend,
                                      smoothed.points[index].y + (continuous.points[index].y - smoothed.points[index].y) * blend);
  }

  UIBezierPath *path = [UIBezierPath bezierPath];
  MorphletAddCorner(path, shape, CGPointMake(w, 0), CGVectorMake(1, 0), CGVectorMake(0, 1), YES);
  MorphletAddCorner(path, shape, CGPointMake(w, h), CGVectorMake(0, 1), CGVectorMake(-1, 0), NO);
  MorphletAddCorner(path, shape, CGPointMake(0, h), CGVectorMake(-1, 0), CGVectorMake(0, -1), NO);
  MorphletAddCorner(path, shape, CGPointMake(0, 0), CGVectorMake(0, -1), CGVectorMake(1, 0), NO);
  [path closePath];
  return path;
}
