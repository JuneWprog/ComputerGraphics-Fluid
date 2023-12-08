/**
 * Function to clamp a value between a minimum and maximum value.
 * For boundary checking.
 * */
export function clamp(x, min, max) 
{
    if (x < min)
        return min;
    else if (x > max)
        return max;
    else 
        return x;
}